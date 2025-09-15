package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"ai-career-buddy/internal/api"
	"ai-career-buddy/internal/db"
	"ai-career-buddy/internal/logger"
	"ai-career-buddy/internal/models"
	"ai-career-buddy/internal/utils"

	"github.com/gin-gonic/gin"
)

type SendMessageRequest struct {
	UserID        string   `json:"userId" binding:"required"`
	ThreadID      string   `json:"threadId"`
	Content       string   `json:"content" binding:"required"`
	Attachments   []string `json:"attachments,omitempty"`
	ModelID       string   `json:"modelId,omitempty"`
	DeepThinking  bool     `json:"deepThinking,omitempty"`
	NetworkSearch bool     `json:"networkSearch,omitempty"`
}

// SendMessage stores the user message and returns an intelligent AI reply.
func SendMessage(c *gin.Context) {
	startTime := time.Now()

	var in SendMessageRequest
	if err := c.ShouldBindJSON(&in); err != nil {
		logger.Error("消息请求解析失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Info("收到消息请求: ThreadID=%s, ModelID=%s, Content长度=%d, 附件数量=%d",
		in.ThreadID, in.ModelID, len(in.Content), len(in.Attachments))

	// 处理附件，提取PDF文本
	var attachmentsJSON string
	var enhancedContent = in.Content

	if len(in.Attachments) > 0 {
		// 处理每个附件
		var processedAttachments []string
		var documentTexts []string

		for _, attachment := range in.Attachments {
			processedAttachments = append(processedAttachments, attachment)

			// 检查是否为PDF
			if strings.HasPrefix(attachment, "data:application/pdf;base64,") {
				pdfExtractor := utils.NewSimplePDFExtractor()
				if pdfExtractor.IsValidPDF(attachment) {
					pdfText, err := pdfExtractor.ExtractTextFromBase64PDF(attachment)
					if err == nil && len(pdfText) > 0 {
						documentTexts = append(documentTexts, "[PDF文档内容]:\n"+pdfText)
					}
				}
			}

			// 检查是否为文档引用（document:格式）
			if strings.HasPrefix(attachment, "document:") {
				documentID := strings.TrimPrefix(attachment, "document:")
				var document models.UserDocument
				if err := db.Conn.Where("id = ?", documentID).First(&document).Error; err == nil {
					// 优先使用分析结果，如果没有则使用原始文档内容
					if document.IsProcessed && document.ExtractedInfo != "" {
						var extractedInfo models.DocumentExtractedInfo
						if err := json.Unmarshal([]byte(document.ExtractedInfo), &extractedInfo); err == nil {
							documentTexts = append(documentTexts, fmt.Sprintf("[%s分析结果]:\n%s", document.DocumentType, document.ExtractedInfo))
						}
					}

					// 同时提供原始文档内容，确保完整信息
					if document.FileContent != "" {
						// 限制文档内容长度，避免prompt过长
						content := document.FileContent
						if len(content) > 3000 {
							content = content[:3000] + "\n... (文档内容较长，已截断)"
						}
						documentTexts = append(documentTexts, fmt.Sprintf("[%s文档内容]:\n%s", document.DocumentType, content))
					}
				}
			}
		}

		// 将文档内容添加到消息内容中
		if len(documentTexts) > 0 {
			enhancedContent += "\n\n" + strings.Join(documentTexts, "\n\n")
		}

		// 存储附件
		attachmentsBytes, _ := json.Marshal(processedAttachments)
		attachmentsJSON = string(attachmentsBytes)
	}

	userMsg := models.Message{
		UserID:      in.UserID,
		Role:        "user",
		Content:     enhancedContent,
		ThreadID:    in.ThreadID,
		Attachments: attachmentsJSON,
	}
	if err := db.Conn.Create(&userMsg).Error; err != nil {
		logger.Error("保存用户消息失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	logger.Debug("用户消息保存成功: ID=%d", userMsg.ID)

	// 生成智能回复
	logger.Info("开始生成AI回复: ModelID=%s, DeepThinking=%t, NetworkSearch=%t",
		in.ModelID, in.DeepThinking, in.NetworkSearch)

	aiReplyContent := generateAIResponse(in.Content, in.ThreadID, in.ModelID, in.DeepThinking, in.NetworkSearch)

	logger.Debug("AI回复生成完成，内容长度: %d", len(aiReplyContent))

	aiReply := models.Message{UserID: in.UserID, Role: "assistant", Content: aiReplyContent, ThreadID: in.ThreadID}
	if err := db.Conn.Create(&aiReply).Error; err != nil {
		logger.Error("保存AI回复失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	logger.Debug("AI回复保存成功: ID=%d", aiReply.ID)

	// 保存职业历史记录
	go saveCareerHistory(in.ThreadID, in.Content, aiReplyContent, in.ModelID, in.Attachments...)

	duration := time.Since(startTime)
	logger.Info("消息处理完成: ThreadID=%s, 总耗时=%v", in.ThreadID, duration)

	// 返回格式与ListMessages保持一致，直接返回消息数组
	c.JSON(http.StatusOK, []models.Message{userMsg, aiReply})
}

// PDFTextExtractRequest PDF文本提取请求
type PDFTextExtractRequest struct {
	Base64Data string `json:"base64Data" binding:"required"`
}

// PDFTextExtractResponse PDF文本提取响应
type PDFTextExtractResponse struct {
	Text    string `json:"text"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

// ExtractPDFText 提取PDF文本
func ExtractPDFText(c *gin.Context) {
	var req PDFTextExtractRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pdfExtractor := utils.NewSimplePDFExtractor()

	// 验证PDF
	if !pdfExtractor.IsValidPDF(req.Base64Data) {
		c.JSON(http.StatusOK, PDFTextExtractResponse{
			Success: false,
			Error:   "无效的PDF文件",
		})
		return
	}

	// 提取文本
	text, err := pdfExtractor.ExtractTextFromBase64PDF(req.Base64Data)
	if err != nil {
		c.JSON(http.StatusOK, PDFTextExtractResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, PDFTextExtractResponse{
		Text:    text,
		Success: true,
	})
}

// StreamMessageRequest 流式消息请求
type StreamMessageRequest struct {
	UserID        string   `json:"userId" binding:"required"`
	ThreadID      string   `json:"threadId"`
	Content       string   `json:"content" binding:"required"`
	Attachments   []string `json:"attachments,omitempty"`
	ModelID       string   `json:"modelId,omitempty"`
	DeepThinking  bool     `json:"deepThinking,omitempty"`
	NetworkSearch bool     `json:"networkSearch,omitempty"`
}

// StreamMessage 流式发送消息
func StreamMessage(c *gin.Context) {
	startTime := time.Now()

	var req StreamMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("流式消息请求解析失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Info("收到流式消息请求: ThreadID=%s, ModelID=%s, Content长度=%d, 附件数量=%d",
		req.ThreadID, req.ModelID, len(req.Content), len(req.Attachments))

	// 处理附件，提取文档内容
	var attachmentsJSON string
	var enhancedContent = req.Content

	if len(req.Attachments) > 0 {
		// 处理每个附件
		var processedAttachments []string
		var documentTexts []string

		for _, attachment := range req.Attachments {
			processedAttachments = append(processedAttachments, attachment)

			// 检查是否为PDF
			if strings.HasPrefix(attachment, "data:application/pdf;base64,") {
				pdfExtractor := utils.NewSimplePDFExtractor()
				if pdfExtractor.IsValidPDF(attachment) {
					pdfText, err := pdfExtractor.ExtractTextFromBase64PDF(attachment)
					if err == nil && len(pdfText) > 0 {
						documentTexts = append(documentTexts, "[PDF文档内容]:\n"+pdfText)
					}
				}
			}

			// 检查是否为文档引用（document:格式）
			if strings.HasPrefix(attachment, "document:") {
				documentID := strings.TrimPrefix(attachment, "document:")
				var document models.UserDocument
				if err := db.Conn.Where("id = ?", documentID).First(&document).Error; err == nil {
					// 优先使用分析结果，如果没有则使用原始文档内容
					if document.IsProcessed && document.ExtractedInfo != "" {
						var extractedInfo models.DocumentExtractedInfo
						if err := json.Unmarshal([]byte(document.ExtractedInfo), &extractedInfo); err == nil {
							documentTexts = append(documentTexts, fmt.Sprintf("[%s分析结果]:\n%s", document.DocumentType, document.ExtractedInfo))
						}
					}

					// 同时提供原始文档内容，确保完整信息
					if document.FileContent != "" {
						// 限制文档内容长度，避免prompt过长
						content := document.FileContent
						if len(content) > 3000 {
							content = content[:3000] + "\n... (文档内容较长，已截断)"
						}
						documentTexts = append(documentTexts, fmt.Sprintf("[%s文档内容]:\n%s", document.DocumentType, content))
					}
				}
			}
		}

		// 将文档内容添加到消息内容中
		if len(documentTexts) > 0 {
			enhancedContent += "\n\n" + strings.Join(documentTexts, "\n\n")
		}

		// 存储附件
		attachmentsBytes, _ := json.Marshal(processedAttachments)
		attachmentsJSON = string(attachmentsBytes)
	}

	// 保存用户消息
	userMsg := models.Message{
		UserID:      req.UserID,
		Role:        "user",
		Content:     enhancedContent,
		ThreadID:    req.ThreadID,
		Attachments: attachmentsJSON,
	}
	if err := db.Conn.Create(&userMsg).Error; err != nil {
		logger.Error("保存用户消息失败: %v", err)
		c.String(http.StatusInternalServerError, "保存消息失败")
		return
	}

	// 设置流式响应头
	c.Header("Content-Type", "text/plain; charset=utf-8")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")

	var aiReplyContent string

	// 如果选择了百炼模型或Azure模型，使用流式API
	if strings.HasPrefix(req.ModelID, "bailian/") || req.ModelID == "nbg-v3-33b" || strings.HasPrefix(req.ModelID, "azure/") {
		logger.Info("使用百炼流式API: ModelID=%s", req.ModelID)
		client := api.NewBailianClient()

		// 构建系统提示词
		systemPrompt := buildSystemPrompt(req.ModelID, req.DeepThinking, req.NetworkSearch)
		fullInput := systemPrompt + "\n\n用户问题: " + enhancedContent

		// 创建收集器来收集流式回复内容
		var responseBuffer strings.Builder
		writer := io.MultiWriter(c.Writer, &responseBuffer)

		// 调用流式API
		err := client.SendStreamMessage(req.ModelID, fullInput, req.Attachments, writer)
		if err != nil {
			logger.Error("百炼流式API调用失败: %v", err)
			c.String(http.StatusInternalServerError, "流式API调用失败: %v", err)
			return
		}
		aiReplyContent = responseBuffer.String()
		logger.Info("百炼流式API调用成功")
	} else {
		logger.Info("使用模拟流式回复: ModelID=%s", req.ModelID)
		// 其他模型使用模拟流式回复
		response := generateAIResponse(req.Content, req.ThreadID, req.ModelID, req.DeepThinking, req.NetworkSearch)
		aiReplyContent = response

		// 模拟流式输出 - 按词输出而不是按字符
		words := strings.Fields(response)
		for i, word := range words {
			if i > 0 {
				c.Writer.WriteString(" ")
			}
			c.Writer.WriteString(word)
			c.Writer.Flush()
			time.Sleep(50 * time.Millisecond) // 适当的延迟，模拟真实的流式体验
		}
		logger.Info("模拟流式回复完成")
	}

	// 保存AI回复
	aiReply := models.Message{
		UserID:   req.UserID,
		Role:     "assistant",
		Content:  aiReplyContent,
		ThreadID: req.ThreadID,
	}
	if err := db.Conn.Create(&aiReply).Error; err != nil {
		logger.Error("保存AI回复失败: %v", err)
		// 注意：这里不返回错误，因为流式响应已经开始
	}

	// 保存职业历史记录
	go saveCareerHistory(req.ThreadID, req.Content, aiReplyContent, req.ModelID, req.Attachments...)

	duration := time.Since(startTime)
	logger.Info("流式消息处理完成: ThreadID=%s, 总耗时=%v", req.ThreadID, duration)
}

// generateAIResponse 根据用户输入、会话类型和模型ID生成智能回复
func generateAIResponse(userInput, threadID, modelID string, deepThinking, networkSearch bool) string {
	// 如果选择了百炼模型或Azure模型，调用真实API
	if strings.HasPrefix(modelID, "bailian/") || modelID == "nbg-v3-33b" || strings.HasPrefix(modelID, "azure/") {
		return callBailianAPI(userInput, modelID, deepThinking, networkSearch)
	}

	// 其他模型使用模拟回复
	// 根据threadID判断会话类型
	var sessionType string
	if len(threadID) > 7 {
		sessionType = threadID[:7] // 取前7个字符作为类型标识
	}

	// 检查是否为案例问题，如果是则提供更详细的回复
	enhancedInput := enhanceInputForExamples(userInput, sessionType)

	// 根据会话类型生成不同的回复
	var response string
	switch sessionType {
	case "career":
		response = generateCareerResponse(enhancedInput, deepThinking, networkSearch)
	case "offer":
		response = generateOfferResponse(enhancedInput, deepThinking, networkSearch)
	case "contract":
		response = generateContractResponse(enhancedInput, deepThinking, networkSearch)
	case "monitor":
		response = generateMonitorResponse(enhancedInput, deepThinking, networkSearch)
	default:
		response = generateGeneralResponse(enhancedInput, deepThinking, networkSearch)
	}

	// 添加模型信息到回复中
	if modelID != "" {
		response += fmt.Sprintf("\n\n[使用模型: %s]", modelID)
	}

	return response
}

// enhanceInputForExamples 为案例问题增强输入内容
func enhanceInputForExamples(input, sessionType string) string {
	// 定义案例关键词映射
	exampleEnhancements := map[string]map[string]string{
		"career": {
			"职业转型": "这是一个关于职业转型的重要问题。让我为您提供详细的转型路径分析，包括技能转换、行业适应、时间规划等方面的专业建议。",
			"技能提升": "技能提升是职业发展的核心。我将从当前市场需求、个人能力评估、学习路径设计等多个维度为您分析。",
			"行业分析": "行业分析需要综合考虑市场趋势、政策环境、技术发展等因素。让我为您提供全面的行业前景分析。",
			"个人品牌": "个人品牌建设是现代职场的重要竞争力。我将从定位策略、内容输出、网络建设等方面为您提供指导。",
		},
		"offer": {
			"薪资谈判":    "薪资谈判需要策略和技巧。让我为您分析谈判要点、市场行情、谈判话术等关键要素。",
			"offer对比": "多Offer选择需要综合考虑多个因素。我将从薪资、发展、文化、风险等维度为您提供决策框架。",
			"福利分析":    "福利待遇的评估需要全面考虑。让我为您分析各种福利的实际价值和潜在风险。",
			"市场行情":    "了解市场行情是做出明智决策的基础。我将为您提供最新的薪资数据和市场趋势分析。",
		},
		"contract": {
			"合同条款": "合同条款的解读需要专业知识和经验。让我为您详细分析各项条款的含义和影响。",
			"风险点":  "识别合同风险点至关重要。我将为您指出常见的风险条款和应对策略。",
			"权益保护": "保护自身权益是每个职场人的必修课。让我为您提供权益保护的具体方法和建议。",
			"合同修改": "合同修改需要技巧和策略。我将为您提供修改建议和沟通技巧。",
		},
		"monitor": {
			"财务状况":  "企业财务状况分析需要专业视角。让我为您提供财务健康度评估和风险预警。",
			"行业地位":  "行业地位评估需要多维度分析。我将为您提供竞争力分析和市场定位建议。",
			"管理层变动": "管理层变动对企业影响深远。让我为您分析变动原因、影响范围和应对策略。",
			"风险预警":  "风险预警需要前瞻性思维。我将为您提供风险识别和预防措施建议。",
		},
	}

	// 检查是否包含案例关键词
	if enhancements, exists := exampleEnhancements[sessionType]; exists {
		for keyword, enhancement := range enhancements {
			if strings.Contains(input, keyword) {
				return enhancement + "\n\n" + input
			}
		}
	}

	return input
}

// callBailianAPI 调用百炼API
func callBailianAPI(userInput, modelID string, deepThinking, networkSearch bool) string {
	startTime := time.Now()
	logger.Info("开始调用百炼API: ModelID=%s, Input长度=%d", modelID, len(userInput))

	client := api.NewBailianClient()

	// 构建系统提示词
	systemPrompt := buildSystemPrompt(modelID, deepThinking, networkSearch)

	// 为案例问题增强系统提示词
	enhancedPrompt := enhanceSystemPromptForExamples(systemPrompt, userInput)

	fullInput := enhancedPrompt + "\n\n用户问题: " + userInput

	// 调用API
	response, err := client.SendMessage(modelID, fullInput, nil)
	duration := time.Since(startTime)

	if err != nil {
		logger.Error("百炼API调用失败: ModelID=%s, 耗时=%v, 错误=%v", modelID, duration, err)
		return fmt.Sprintf("抱歉，调用AI模型时出现错误: %v\n\n[使用模型: %s]", err, modelID)
	}

	logger.Info("百炼API调用成功: ModelID=%s, 耗时=%v, 回复长度=%d",
		modelID, duration, len(response.Choices[0].Message.Content))

	// 提取回复内容
	if len(response.Choices) > 0 {
		content := response.Choices[0].Message.Content
		content += fmt.Sprintf("\n\n[使用模型: %s]", modelID)
		return content
	}

	logger.Warn("百炼API返回空回复: ModelID=%s", modelID)
	return fmt.Sprintf("抱歉，AI模型没有返回有效回复。\n\n[使用模型: %s]", modelID)
}

// enhanceSystemPromptForExamples 为案例问题增强系统提示词
func enhanceSystemPromptForExamples(basePrompt, userInput string) string {
	// 检查是否为案例问题
	caseKeywords := []string{
		"职业转型", "技能提升", "行业分析", "个人品牌",
		"薪资谈判", "offer对比", "福利分析", "市场行情",
		"合同条款", "风险点", "权益保护", "合同修改",
		"财务状况", "行业地位", "管理层变动", "风险预警",
	}

	for _, keyword := range caseKeywords {
		if strings.Contains(userInput, keyword) {
			basePrompt += fmt.Sprintf("\n\n【案例专项指导】用户询问的是关于'%s'的专业问题，请提供：\n"+
				"1. 详细的分析框架和评估维度\n"+
				"2. 具体的操作步骤和实用建议\n"+
				"3. 相关的案例分享和经验总结\n"+
				"4. 潜在风险和注意事项\n"+
				"5. 后续跟进和持续优化的建议", keyword)
			break
		}
	}

	return basePrompt
}

// buildSystemPrompt 构建系统提示词
func buildSystemPrompt(modelID string, deepThinking, networkSearch bool) string {
	basePrompt := "你是AI职场管家，专业的职场顾问助手。请根据用户的问题提供专业、实用的建议。"

	// 深度思考模式
	if deepThinking {
		basePrompt += "\n\n【深度思考模式】请进行深度分析：\n" +
			"1. 多角度分析问题，考虑不同维度和可能性\n" +
			"2. 提供详细的推理过程和逻辑链条\n" +
			"3. 分析潜在风险和机会\n" +
			"4. 给出具体的行动建议和步骤\n" +
			"5. 提供相关的案例或经验分享"
	}

	// 网络搜索模式
	if networkSearch {
		basePrompt += "\n\n【网络搜索模式】请结合最新信息：\n" +
			"1. 提供最新的行业动态和趋势\n" +
			"2. 引用权威数据和报告\n" +
			"3. 分析当前市场状况\n" +
			"4. 给出时效性强的建议"
	}

	// 根据模型类型添加特定提示
	if strings.Contains(modelID, "azure/gpt") {
		basePrompt += " 你基于Azure OpenAI GPT-5模型，拥有最新的AI技术，擅长多语言对话、逻辑推理和创意生成。"
	} else if strings.Contains(modelID, "qwen") {
		basePrompt += " 你基于通义千问模型，擅长中文理解和生成。"
	} else if strings.Contains(modelID, "deepseek") {
		basePrompt += " 你基于DeepSeek模型，擅长逻辑推理和代码分析。"
	} else if strings.Contains(modelID, "gpt") {
		basePrompt += " 你基于GPT模型，擅长多语言对话和创意生成。"
	}

	basePrompt += " 请用中文回复，保持专业、友好的语调。"

	return basePrompt
}

// generateCareerResponse 生成职业规划相关的回复
func generateCareerResponse(input string, deepThinking, networkSearch bool) string {
	var response string

	if deepThinking {
		response = "🧠 **深度思考模式 - 职业规划分析**\n\n" +
			"基于您的问题：" + input + "\n\n" +
			"**多维度分析框架**：\n\n" +
			"1. **个人维度分析**：\n" +
			"   - 核心能力评估：技术技能、软技能、领导力\n" +
			"   - 价值观匹配：工作意义、生活平衡、成长需求\n" +
			"   - 性格特质：内向/外向、风险偏好、创新倾向\n\n" +
			"2. **市场维度分析**：\n" +
			"   - 行业趋势：数字化转型、新兴技术、政策影响\n" +
			"   - 岗位需求：技能要求变化、薪资水平、竞争激烈程度\n" +
			"   - 地域因素：一线城市vs二三线城市的机会差异\n\n" +
			"3. **时间维度分析**：\n" +
			"   - 短期（1-2年）：技能提升、经验积累、网络建设\n" +
			"   - 中期（3-5年）：职位晋升、专业深化、影响力扩大\n" +
			"   - 长期（5-10年）：行业专家、创业机会、财务自由\n\n" +
			"**风险评估与机会识别**：\n" +
			"- 潜在风险：技术替代、行业衰退、个人能力瓶颈\n" +
			"- 发展机会：新兴领域、政策支持、市场需求增长\n\n" +
			"**具体行动建议**：\n" +
			"1. 制定SMART目标（具体、可衡量、可达成、相关、有时限）\n" +
			"2. 建立学习计划：在线课程、认证考试、实践项目\n" +
			"3. 构建人脉网络：行业会议、专业社群、导师关系\n" +
			"4. 定期复盘调整：季度评估、年度规划、灵活调整\n\n" +
			"您希望我针对哪个具体维度进行更深入的分析？"
	} else {
		responses := []string{
			"作为职业规划专家，我理解您提到的" + input + "。让我为您分析一下职业发展路径：\n\n1. **现状分析**：首先需要评估您当前的技能水平和职业状态\n2. **目标设定**：明确您的短期和长期职业目标\n3. **技能提升**：制定针对性的技能提升计划\n4. **网络建设**：建立专业人脉网络\n5. **持续学习**：保持行业敏感度和学习能力\n\n您希望我重点帮您分析哪个方面呢？",
			"关于职业规划，我建议从以下几个维度来思考：\n\n**个人SWOT分析**：\n- 优势(Strengths)：您的核心技能和特长\n- 劣势(Weaknesses)：需要改进的方面\n- 机会(Opportunities)：行业发展趋势和机遇\n- 威胁(Threats)：可能面临的挑战\n\n**职业发展建议**：\n1. 制定3-5年职业规划\n2. 定期评估和调整目标\n3. 关注行业动态和新兴技能\n4. 建立个人品牌\n\n您目前处于职业发展的哪个阶段？我可以为您提供更具体的建议。",
			"职业规划是一个持续的过程，需要结合个人兴趣、能力和市场需求。基于您提到的" + input + "，我建议：\n\n**短期目标（1-2年）**：\n- 提升核心专业技能\n- 完成相关认证或培训\n- 积累项目经验\n\n**中期目标（3-5年）**：\n- 争取晋升或转岗机会\n- 建立行业影响力\n- 拓展管理技能\n\n**长期目标（5年以上）**：\n- 成为行业专家或领导者\n- 考虑创业或投资机会\n- 实现财务自由\n\n您希望我帮您制定哪个阶段的具体计划？",
		}
		response = responses[0] // 简化处理，使用第一个回复
	}

	if networkSearch {
		response += "\n\n🌐 **网络搜索模式**：\n" +
			"建议您关注最新的行业报告和趋势分析，如：\n" +
			"- LinkedIn职场趋势报告\n" +
			"- 各大招聘平台的人才需求分析\n" +
			"- 行业权威机构的年度报告\n" +
			"- 专业媒体的深度分析文章"
	}

	return response
}

// generateOfferResponse 生成Offer分析相关的回复
func generateOfferResponse(input string, deepThinking, networkSearch bool) string {
	var response string

	if deepThinking {
		response = "🧠 **深度思考模式 - Offer分析**\n\n" +
			"基于您的问题：" + input + "\n\n" +
			"**多维度Offer评估框架**：\n\n" +
			"1. **财务维度深度分析**：\n" +
			"   - 薪资结构：基本工资、绩效奖金、年终奖、股权激励\n" +
			"   - 隐性收益：五险一金比例、补充商业保险、企业年金\n" +
			"   - 长期价值：股权增值潜力、期权行权条件、分红政策\n" +
			"   - 税务优化：薪资结构对个税的影响\n\n" +
			"2. **职业发展维度分析**：\n" +
			"   - 技能匹配度：岗位要求与个人能力的契合程度\n" +
			"   - 成长空间：学习机会、培训资源、导师制度\n" +
			"   - 晋升路径：职业发展通道、晋升周期、管理层机会\n" +
			"   - 行业影响：在行业内的地位和影响力\n\n" +
			"3. **风险收益评估**：\n" +
			"   - 公司稳定性：财务状况、行业地位、发展前景\n" +
			"   - 市场风险：行业趋势、竞争态势、政策影响\n" +
			"   - 个人风险：技能过时风险、职业发展瓶颈\n" +
			"   - 机会成本：放弃其他机会的代价\n\n" +
			"**谈判策略深度分析**：\n" +
			"- 信息收集：市场薪资调研、同行业对比、公司薪酬体系\n" +
			"- 价值包装：突出独特技能、项目经验、行业资源\n" +
			"- 谈判技巧：多轮谈判、分项讨论、创造双赢\n" +
			"- 备选方案：多个Offer对比、谈判底线设定\n\n" +
			"**决策建议**：\n" +
			"1. 制作详细的对比表格，量化各项指标\n" +
			"2. 考虑3-5年的长期收益和发展\n" +
			"3. 评估个人风险承受能力和职业目标\n" +
			"4. 咨询行业专家和职业顾问的意见\n\n" +
			"您希望我针对哪个具体方面进行更深入的分析？"
	} else {
		responses := []string{
			"作为Offer分析专家，我来帮您分析这个职位机会。基于您提到的" + input + "，我建议从以下角度评估：\n\n**薪资分析**：\n- 对比同行业同岗位的市场薪资水平\n- 考虑地域差异和公司规模\n- 评估薪资增长空间\n\n**福利待遇**：\n- 五险一金缴纳比例\n- 年假、病假等假期政策\n- 培训和发展机会\n- 股权激励或奖金制度\n\n**发展前景**：\n- 公司行业地位和发展趋势\n- 岗位晋升通道\n- 技能提升机会\n\n您能提供更多关于这个Offer的具体信息吗？",
			"Offer评估需要综合考虑多个因素。让我为您提供一个评估框架：\n\n**财务回报**：\n- 基本薪资是否合理\n- 绩效奖金和年终奖\n- 长期激励（股权、期权）\n- 隐性福利（餐补、交通、住房）\n\n**职业发展**：\n- 岗位职责是否匹配职业规划\n- 学习成长机会\n- 团队和领导情况\n- 公司文化和发展前景\n\n**工作环境**：\n- 工作地点和通勤时间\n- 工作强度和压力\n- 团队氛围和同事关系\n\n您最关心哪个方面的评估？我可以为您提供更详细的分析。",
			"在评估Offer时，建议您制作一个对比表格。基于您提到的" + input + "，我帮您分析：\n\n**谈判策略**：\n1. **了解市场行情**：通过招聘网站、猎头了解同类岗位薪资\n2. **突出自身价值**：强调您的独特技能和经验\n3. **合理表达期望**：基于市场数据提出合理要求\n4. **灵活谈判**：薪资、福利、发展机会都可以谈\n\n**决策建议**：\n- 不要只看薪资数字，要考虑综合收益\n- 关注长期发展机会\n- 评估风险承受能力\n- 考虑个人生活平衡\n\n您希望我帮您制定具体的谈判策略吗？",
		}
		response = responses[0]
	}

	if networkSearch {
		response += "\n\n🌐 **网络搜索模式**：\n" +
			"建议您查询最新的薪资数据：\n" +
			"- 智联招聘、前程无忧的薪资报告\n" +
			"- Glassdoor、看准网的公司评价\n" +
			"- 行业薪资调研报告\n" +
			"- 猎头公司的市场分析"
	}

	return response
}

// generateContractResponse 生成合同审查相关的回复
func generateContractResponse(input string, deepThinking, networkSearch bool) string {
	responses := []string{
		"作为劳动合同审查专家，我来帮您分析合同条款。基于您提到的" + input + "，需要重点关注：\n\n**关键条款检查**：\n- **工作内容**：岗位职责是否明确\n- **薪资待遇**：基本工资、绩效奖金、福利待遇\n- **工作时间**：工作地点、工作时间、加班政策\n- **试用期**：试用期长度、薪资标准、转正条件\n\n**风险点识别**：\n- 竞业限制条款是否合理\n- 保密协议范围是否过大\n- 违约金设置是否过高\n- 解除合同条件是否公平\n\n**权益保护**：\n- 社会保险和公积金缴纳\n- 年假、病假等假期权利\n- 培训费用承担\n- 知识产权归属\n\n您能提供合同的具体条款吗？我可以为您详细分析。",
		"劳动合同是保护双方权益的重要文件。让我为您详细解读关键条款：\n\n**薪资结构**：\n- 基本工资：固定部分，不能随意调整\n- 绩效工资：与考核结果挂钩\n- 福利待遇：五险一金、餐补、交通费等\n- 年终奖：发放条件和标准\n\n**工作时间**：\n- 标准工时：每日8小时，每周40小时\n- 加班费：平时1.5倍，周末2倍，节假日3倍\n- 年假：工作满1年享受带薪年假\n- 病假：医疗期内不得解除合同\n\n**解除合同**：\n- 双方协商一致\n- 提前通知期（通常30天）\n- 经济补偿金计算\n- 竞业限制补偿\n\n您对哪个条款有疑问？我可以为您详细解释。",
		"合同审查需要专业细致的分析。基于您提到的" + input + "，我建议重点关注：\n\n**常见陷阱**：\n1. **试用期过长**：超过6个月可能违法\n2. **薪资模糊**：只写\"面议\"或\"按公司规定\"\n3. **加班费**：不明确计算标准\n4. **违约金过高**：超出合理范围\n5. **竞业限制过严**：限制范围过大或时间过长\n\n**修改建议**：\n- 要求明确薪资结构和发放时间\n- 明确工作地点和岗位职责\n- 要求合理的试用期和转正条件\n- 确保社会保险和公积金缴纳\n- 明确解除合同的条件和补偿\n\n**法律依据**：\n- 《劳动法》和《劳动合同法》\n- 当地最低工资标准\n- 社会保险法相关规定\n\n您希望我帮您起草修改建议吗？",
	}
	return responses[0] // 简化处理
}

// generateMonitorResponse 生成企业监控相关的回复
func generateMonitorResponse(input string, deepThinking, networkSearch bool) string {
	responses := []string{
		"作为企业监控专家，我来帮您分析企业动态。基于您提到的" + input + "，我建议从以下维度监控：\n\n**财务状况监控**：\n- 营收增长趋势和盈利能力\n- 现金流状况和偿债能力\n- 投资和融资活动\n- 财务风险指标\n\n**业务发展监控**：\n- 市场份额变化\n- 新产品或服务发布\n- 重大合同和合作\n- 业务扩张或收缩\n\n**管理层变动**：\n- 高管人事变动\n- 董事会成员变化\n- 战略方向调整\n- 组织架构调整\n\n**行业地位**：\n- 竞争对手动态\n- 行业政策变化\n- 技术发展趋势\n- 市场环境变化\n\n您最关心哪个方面的监控？我可以为您提供具体的监控方案。",
		"企业监控需要建立系统化的信息收集和分析体系。让我为您设计监控框架：\n\n**信息收集渠道**：\n- **官方渠道**：年报、季报、公告、官网\n- **媒体报道**：新闻、行业报告、分析文章\n- **社交网络**：Boss直聘、微博、知乎等\n- **专业平台**：天眼查、企查查、Wind等\n\n**监控指标**：\n- **财务指标**：营收、利润、现金流、负债率\n- **业务指标**：客户数量、市场份额、产品销量\n- **人员指标**：员工数量、离职率、招聘情况\n- **风险指标**：法律诉讼、监管处罚、负面新闻\n\n**预警机制**：\n- 设置关键指标阈值\n- 建立定期报告制度\n- 制定应急响应预案\n- 建立信息验证机制\n\n您希望我帮您建立哪个方面的监控体系？",
		"企业监控的关键是及时识别风险和机会。基于您提到的" + input + "，我建议：\n\n**风险预警系统**：\n1. **财务风险**：\n   - 现金流紧张\n   - 债务违约风险\n   - 盈利能力下降\n   - 投资回报率低\n\n2. **经营风险**：\n   - 市场份额下降\n   - 客户流失严重\n   - 供应链中断\n   - 技术落后\n\n3. **法律风险**：\n   - 监管政策变化\n   - 法律诉讼增加\n   - 合规问题频发\n   - 知识产权纠纷\n\n**机会识别**：\n- 行业政策利好\n- 新技术应用\n- 市场扩张机会\n- 合作并购可能\n\n**应对策略**：\n- 建立预警机制\n- 制定应急预案\n- 保持信息敏感度\n- 建立专业网络\n\n您希望我帮您制定具体的风险应对策略吗？",
	}
	return responses[0] // 简化处理
}

// generateGeneralResponse 生成通用回复
func generateGeneralResponse(input string, deepThinking, networkSearch bool) string {
	return "感谢您的提问：" + input + "。作为AI职场管家，我可以为您提供以下专业服务：\n\n🎯 **职业生涯规划**：职业路径规划、技能提升建议、行业趋势分析\n💰 **Offer分析**：薪资水平分析、福利待遇评估、谈判策略建议\n📋 **劳动合同检查**：合同条款解读、风险点识别、权益保护建议\n🏢 **企业监控**：财务状况监控、业务发展追踪、风险预警提醒\n\n请选择您需要的服务类型，我会为您提供更专业的帮助！"
}

func ListMessages(c *gin.Context) {
	threadID := c.Query("threadId")
	var msgs []models.Message
	q := db.Conn.Order("created_at asc")
	if threadID != "" {
		q = q.Where("thread_id = ?", threadID)
	}
	if err := q.Find(&msgs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, msgs)
}

// saveCareerHistory 异步保存职业历史记录
func saveCareerHistory(threadID, userInput, aiResponse, modelID string, attachments ...string) {
	// 从threadID提取用户ID和分类
	var userID, category string
	userID = "default-user" // 暂时使用默认用户ID，后续可以从认证中获取

	// 根据threadID前缀确定分类
	if strings.HasPrefix(threadID, "career-") {
		category = "career"
	} else if strings.HasPrefix(threadID, "offer-") {
		category = "offer"
	} else if strings.HasPrefix(threadID, "contract-") {
		category = "contract"
	} else if strings.HasPrefix(threadID, "monitor-") {
		category = "monitor"
	} else {
		category = "unknown" // 默认分类
	}

	// 调试日志
	logger.Info("保存职业历史记录: ThreadID=%s, Category=%s", threadID, category)

	// 根据内容智能识别分类（覆盖threadID分类）
	if isMonitorContent(userInput) {
		category = "monitor"
	}

	// 生成问题标题（取前50个字符）
	title := userInput
	if utf8.RuneCountInString(title) > 50 {
		// 安全截取：按字符数截取，避免截断UTF-8字符
		runes := []rune(title)
		if len(runes) > 50 {
			title = string(runes[:50]) + "..."
		}
	}

	// 提取标签
	tags := extractTags(userInput, category)

	// 构建元数据，包含附件信息
	var metadata map[string]interface{}
	if len(attachments) > 0 {
		metadata = map[string]interface{}{
			"attachments": attachments,
		}
	}

	// 将元数据转换为JSON字符串
	var metadataJSON string
	if metadata != nil {
		if metadataBytes, err := json.Marshal(metadata); err == nil {
			metadataJSON = string(metadataBytes)
		}
	}

	history := models.CareerHistory{
		UserID:       userID,
		ThreadID:     threadID,
		Category:     category,
		Title:        title,
		Content:      userInput,
		AIResponse:   aiResponse,
		ModelID:      modelID,
		Tags:         tags,
		Rating:       0, // 默认未评分
		IsBookmarked: false,
		Metadata:     metadataJSON,
	}

	if err := db.Conn.Create(&history).Error; err != nil {
		logger.Error("保存职业历史记录失败: ThreadID=%s, 错误=%v", threadID, err)
		return
	}

	logger.Info("职业历史记录保存成功: ThreadID=%s, Category=%s", threadID, category)
}

// isMonitorContent 判断内容是否属于企业监控相关
func isMonitorContent(content string) bool {
	// 企业监控相关的关键词
	monitorKeywords := []string{
		"通风处", "监控", "企业", "公司", "风险", "预警", "财务", "管理层",
		"市场", "股票", "股价", "财报", "业绩", "投资", "融资", "并购",
		"高管", "CEO", "CFO", "董事会", "股东", "股权", "上市", "退市",
		"监管", "合规", "审计", "内控", "风控", "法务", "诉讼", "仲裁",
	}

	contentLower := strings.ToLower(content)
	for _, keyword := range monitorKeywords {
		if strings.Contains(contentLower, keyword) {
			return true
		}
	}
	return false
}

// extractTags 从用户输入中提取标签
func extractTags(input, category string) string {
	var tags []string

	// 根据分类添加基础标签
	switch category {
	case "career":
		tags = append(tags, "职业规划")
	case "offer":
		tags = append(tags, "Offer分析")
	case "contract":
		tags = append(tags, "合同审查")
	case "monitor":
		tags = append(tags, "企业监控")
	}

	// 根据关键词添加标签
	keywordMap := map[string]string{
		"职业转型": "转型", "技能提升": "技能", "行业分析": "行业",
		"薪资谈判": "薪资", "福利分析": "福利", "市场行情": "市场",
		"合同条款": "条款", "风险点": "风险", "权益保护": "权益",
		"财务状况": "财务", "管理层": "管理", "风险预警": "预警",
	}

	for keyword, tag := range keywordMap {
		if strings.Contains(input, keyword) {
			tags = append(tags, tag)
		}
	}

	// 转换为JSON字符串
	data, err := json.Marshal(tags)
	if err != nil {
		return "[]"
	}
	return string(data)
}

// formatExtractedInfo 格式化提取的信息为更易读的格式
func formatExtractedInfo(info *models.DocumentExtractedInfo, documentType string) string {
	var result strings.Builder

	switch documentType {
	case "resume":
		if info.PersonalInfo.Name != "" {
			result.WriteString(fmt.Sprintf("**个人信息**: %s\n", info.PersonalInfo.Name))
		}
		if len(info.WorkExperience) > 0 {
			result.WriteString("**工作经历**:\n")
			for i, exp := range info.WorkExperience {
				result.WriteString(fmt.Sprintf("%d. %s - %s (%s)\n", i+1, exp.Position, exp.Company, exp.Duration))
			}
		}
		if len(info.Skills.Technical) > 0 {
			result.WriteString(fmt.Sprintf("**技术技能**: %s\n", strings.Join(info.Skills.Technical, ", ")))
		}

	case "contract":
		if info.ContractInfo.CompanyName != "" {
			result.WriteString(fmt.Sprintf("**公司**: %s\n", info.ContractInfo.CompanyName))
		}
		if info.ContractInfo.Position != "" {
			result.WriteString(fmt.Sprintf("**职位**: %s\n", info.ContractInfo.Position))
		}
		if info.ContractInfo.Salary != "" {
			result.WriteString(fmt.Sprintf("**薪资**: %s\n", info.ContractInfo.Salary))
		}
		if len(info.ContractInfo.Benefits) > 0 {
			result.WriteString(fmt.Sprintf("**福利**: %s\n", strings.Join(info.ContractInfo.Benefits, ", ")))
		}

	case "offer":
		if info.OfferInfo.CompanyName != "" {
			result.WriteString(fmt.Sprintf("**公司**: %s\n", info.OfferInfo.CompanyName))
		}
		if info.OfferInfo.Position != "" {
			result.WriteString(fmt.Sprintf("**职位**: %s\n", info.OfferInfo.Position))
		}
		if info.OfferInfo.Salary != "" {
			result.WriteString(fmt.Sprintf("**薪资**: %s\n", info.OfferInfo.Salary))
		}
		if info.OfferInfo.Bonus != "" {
			result.WriteString(fmt.Sprintf("**奖金**: %s\n", info.OfferInfo.Bonus))
		}
		if len(info.OfferInfo.Benefits) > 0 {
			result.WriteString(fmt.Sprintf("**福利**: %s\n", strings.Join(info.OfferInfo.Benefits, ", ")))
		}

	case "employment":
		if info.EmploymentInfo.CompanyName != "" {
			result.WriteString(fmt.Sprintf("**公司**: %s\n", info.EmploymentInfo.CompanyName))
		}
		if info.EmploymentInfo.Position != "" {
			result.WriteString(fmt.Sprintf("**职位**: %s\n", info.EmploymentInfo.Position))
		}
		if len(info.EmploymentInfo.Responsibilities) > 0 {
			result.WriteString(fmt.Sprintf("**职责**: %s\n", strings.Join(info.EmploymentInfo.Responsibilities, ", ")))
		}
		if len(info.EmploymentInfo.SkillsUsed) > 0 {
			result.WriteString(fmt.Sprintf("**使用技能**: %s\n", strings.Join(info.EmploymentInfo.SkillsUsed, ", ")))
		}

	default:
		result.WriteString("**文档信息**: 通用文档类型\n")
		// 尝试从其他字段提取有用信息
		if info.PersonalInfo.Name != "" {
			result.WriteString(fmt.Sprintf("**姓名**: %s\n", info.PersonalInfo.Name))
		}
		if len(info.Skills.Technical) > 0 {
			result.WriteString(fmt.Sprintf("**技能**: %s\n", strings.Join(info.Skills.Technical, ", ")))
		}
	}

	return result.String()
}
