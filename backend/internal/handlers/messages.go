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
					// 优先使用分析结果
					if document.IsProcessed && document.ExtractedInfo != "" {
						var extractedInfo models.DocumentExtractedInfo
						if err := json.Unmarshal([]byte(document.ExtractedInfo), &extractedInfo); err == nil {
							documentTexts = append(documentTexts, fmt.Sprintf("[%s分析结果]:\n%s", document.DocumentType, document.ExtractedInfo))
						}
					} else {
						// 如果没有分析结果，提供文档摘要而不是完整内容
						if document.FileContent != "" {
							summary := document.FileContent
							documentTexts = append(documentTexts, fmt.Sprintf("[%s文档摘要]:\n%s", document.DocumentType, summary))
						}
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

	// 清理AI回复内容
	cleanedAIReply := utils.SanitizeForDatabase(aiReplyContent)
	aiReply := models.Message{UserID: in.UserID, Role: "assistant", Content: cleanedAIReply, ThreadID: in.ThreadID}
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
					// 优先使用分析结果
					if document.IsProcessed && document.ExtractedInfo != "" {
						var extractedInfo models.DocumentExtractedInfo
						if err := json.Unmarshal([]byte(document.ExtractedInfo), &extractedInfo); err == nil {
							documentTexts = append(documentTexts, fmt.Sprintf("[%s分析结果]:\n%s", document.DocumentType, document.ExtractedInfo))
						}
					} else {
						// 如果没有分析结果，提供文档摘要而不是完整内容
						if document.FileContent != "" {
							summary := document.FileContent
							documentTexts = append(documentTexts, fmt.Sprintf("[%s文档摘要]:\n%s", document.DocumentType, summary))
						}
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

	// 清理消息内容，移除不兼容字符
	cleanedContent := utils.SanitizeForDatabase(enhancedContent)
	cleanedAttachments := utils.SanitizeForDatabase(attachmentsJSON)

	// 保存用户消息
	userMsg := models.Message{
		UserID:      req.UserID,
		Role:        "user",
		Content:     cleanedContent,
		ThreadID:    req.ThreadID,
		Attachments: cleanedAttachments,
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

	// 清理AI回复内容
	cleanedAIReply := utils.SanitizeForDatabase(aiReplyContent)

	// 保存AI回复
	aiReply := models.Message{
		UserID:   req.UserID,
		Role:     "assistant",
		Content:  cleanedAIReply,
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
		sessionType = strings.Split(threadID, "-")[0] // 取前7个字符作为类型标识
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

	// 添加智能回复指令
	basePrompt += "\n\n【智能回复策略】请根据用户问题的详细程度选择回复方式：\n" +
		"- **直接回答**：优先直接提供专业建议和解决方案\n" +
		"- **分析问题**：仔细理解用户的问题内容和背景\n" +
		"- **提供建议**：基于现有信息给出实用的建议\n" +
		"- **补充说明**：如果信息不足，在回答中说明需要更多信息\n" +
		"- **友好语气**：使用自然、友好的语气进行回复\n" +
		"- **避免重复询问**：不要总是先问问题，要直接提供价值\n\n" +
		"**回复原则**：\n" +
		"1. 优先直接回答用户问题，提供专业建议\n" +
		"2. 如果信息不足，在回答中说明并给出一般性建议\n" +
		"3. 只有在确实需要关键信息时才询问1-2个问题\n" +
		"4. 提供实用的解决方案和具体步骤\n" +
		"5. 使用专业知识和经验给出建议\n\n" +
		"**回复格式**：\n" +
		"- 优先直接提供专业建议和解决方案\n" +
		"- 如果信息不足，先给出一般性建议，再询问关键信息\n" +
		"- 提供具体的行动步骤和实用建议"

	// 添加markdown格式化指令
	basePrompt += "\n\n【回复格式要求】请使用markdown格式组织回复内容：\n" +
		"- 使用标题（# ## ###）来组织内容结构\n" +
		"- 使用**粗体**来强调重要信息\n" +
		"- 使用列表（- 或 1.）来组织要点\n" +
		"- 使用表格来对比数据\n" +
		"- 使用> 引用重要提示\n" +
		"- 使用`代码`来标记专业术语\n" +
		"- 使用==高亮==来标记关键信息"

	// 深度思考模式
	if deepThinking {
		basePrompt += "\n\n【深度思考模式】请进行深度分析：\n" +
			"1. 多角度分析问题，考虑不同维度和可能性\n" +
			"2. 提供详细的推理过程和逻辑链条\n" +
			"3. 分析潜在风险和机会\n" +
			"4. 给出具体的行动建议和步骤\n" +
			"5. 提供相关的案例或经验分享\n" +
			"6. 使用表格对比不同方案\n" +
			"7. 提供任务清单格式的行动计划"
	}

	// 网络搜索模式
	if networkSearch {
		basePrompt += "\n\n【网络搜索模式】请结合最新信息：\n" +
			"1. 提供最新的行业动态和趋势\n" +
			"2. 引用权威数据和报告\n" +
			"3. 分析当前市场状况\n" +
			"4. 给出时效性强的建议\n" +
			"5. 使用表格展示数据对比\n" +
			"6. 提供数据来源链接"
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

	basePrompt += " 请用中文回复，保持专业、友好的语调，并确保使用markdown格式使内容更易读。"

	return basePrompt
}

// generateCareerResponse 生成职业规划相关的回复
func generateCareerResponse(input string, deepThinking, networkSearch bool) string {
	var response string

	// 分析用户问题是否详细，决定是否需要询问
	if len(input) < 10 || !containsKeywords(input, []string{"专业", "年级", "工作", "经验", "目标", "行业", "技能"}) {
		// 问题不够详细，询问关键信息
		response = "## 💼 职业规划咨询\n\n" +
			"> **为了更好地为您提供个性化建议，请告诉我：**\n\n" +
			"- 您当前的工作/学习状态（专业、年级、工作经验等）\n" +
			"- 您的职业目标或期望\n" +
			"- 您最关心的方面\n\n" +
			"**请分享这些信息，我会为您制定个性化的职业规划方案！**"
	} else {
		// 问题已经详细，直接提供建议
		response = "## 💼 职业规划建议\n\n" +
			"基于您提供的信息，我为您分析如下：\n\n"

		if deepThinking {
			response += "## 🧠 深度分析\n\n" +
				"**多维度评估**：\n" +
				"- **个人能力**：技能、经验、性格匹配\n" +
				"- **市场机会**：行业趋势、岗位需求\n" +
				"- **时间规划**：短期(1-2年)、中期(3-5年)、长期(5+年)\n\n" +
				"**风险评估**：\n" +
				"- 技术风险：技能过时 vs 新兴机会\n" +
				"- 市场风险：竞争加剧 vs 需求增长\n" +
				"- 个人风险：能力瓶颈 vs 成长空间\n\n" +
				"**行动计划**：\n" +
				"- [ ] 制定SMART目标\n" +
				"- [ ] 技能提升计划\n" +
				"- [ ] 人脉网络建设\n" +
				"- [ ] 定期复盘调整"
		} else {
			response += "## 📋 规划要点\n\n" +
				"**核心要素**：\n" +
				"- **现状评估**：技能水平、职业状态\n" +
				"- **目标设定**：短期和长期目标\n" +
				"- **技能提升**：针对性学习计划\n" +
				"- **网络建设**：专业人脉建立\n\n" +
				"**发展路径**：\n" +
				"1. 短期(1-2年)：技能提升、经验积累\n" +
				"2. 中期(3-5年)：职位晋升、专业深化\n" +
				"3. 长期(5+年)：行业专家、创业机会"
		}

		if networkSearch {
			response += "\n\n🌐 **最新信息**：\n" +
				"- LinkedIn职场趋势报告\n" +
				"- 招聘平台人才需求分析\n" +
				"- 行业权威机构报告"
		}
	}

	return response
}

// containsKeywords 检查输入是否包含关键词
func containsKeywords(input string, keywords []string) bool {
	for _, keyword := range keywords {
		if strings.Contains(input, keyword) {
			return true
		}
	}
	return false
}

// generateOfferResponse 生成Offer分析相关的回复
func generateOfferResponse(input string, deepThinking, networkSearch bool) string {
	var response string

	// 分析用户问题是否详细，决定是否需要询问
	if len(input) < 10 || !containsKeywords(input, []string{"薪资", "工资", "福利", "公司", "职位", "股权", "奖金", "待遇"}) {
		// 问题不够详细，询问关键信息
		response = "## 💰 Offer分析咨询\n\n" +
			"> **为了更好地为您分析Offer，请告诉我：**\n\n" +
			"- Offer的具体内容（薪资、福利、职位等）\n" +
			"- 您当前的工作情况和薪资水平\n" +
			"- 您最关心的评估维度\n\n" +
			"**请分享这些信息，我会为您提供专业的分析和建议！**"
	} else {
		// 问题已经详细，直接提供建议
		response = "## 💰 Offer分析建议\n\n" +
			"基于您提供的信息，我为您分析如下：\n\n"

		if deepThinking {
			response += "## 🧠 深度分析\n\n" +
				"**多维度评估**：\n" +
				"- **财务维度**：薪资结构、股权激励、隐性收益\n" +
				"- **发展维度**：技能匹配、成长空间、晋升路径\n" +
				"- **风险维度**：公司稳定性、市场风险、机会成本\n\n" +
				"**薪资对比**：\n" +
				"| 项目 | 当前Offer | 市场平均 | 评估 |\n" +
				"|------|-----------|----------|------|\n" +
				"| 基本薪资 | - | - | ⭐⭐⭐⭐⭐ |\n" +
				"| 绩效奖金 | - | - | ⭐⭐⭐⭐⭐ |\n" +
				"| 股权激励 | - | - | ⭐⭐⭐⭐⭐ |\n\n" +
				"**谈判策略**：\n" +
				"- [ ] 市场薪资调研\n" +
				"- [ ] 突出独特价值\n" +
				"- [ ] 多轮谈判推进\n" +
				"- [ ] 备选方案准备"
		} else {
			response += "## 📊 分析要点\n\n" +
				"**核心评估**：\n" +
				"- **薪资分析**：市场对比、增长空间\n" +
				"- **福利待遇**：五险一金、假期政策、培训机会\n" +
				"- **发展前景**：公司地位、晋升通道、技能提升\n\n" +
				"**决策要点**：\n" +
				"1. 综合收益评估（不只是薪资）\n" +
				"2. 长期发展机会\n" +
				"3. 风险承受能力\n" +
				"4. 生活平衡考虑"
		}

		if networkSearch {
			response += "\n\n🌐 **最新数据**：\n" +
				"- 智联招聘、前程无忧薪资报告\n" +
				"- Glassdoor、看准网公司评价\n" +
				"- 行业薪资调研报告"
		}
	}

	return response
}

// generateContractResponse 生成合同审查相关的回复
func generateContractResponse(input string, deepThinking, networkSearch bool) string {
	var response string

	// 分析用户问题是否详细，决定是否需要询问
	if len(input) < 10 || !containsKeywords(input, []string{"合同", "薪资", "福利", "公司", "职位", "条款", "风险", "竞业"}) {
		// 问题不够详细，询问关键信息
		response = "## 📋 合同分析咨询\n\n" +
			"> **为了更好地为您分析合同，请告诉我：**\n\n" +
			"- 合同的具体内容（薪资、福利、条款等）\n" +
			"- 您最关心的合同条款\n" +
			"- 您希望了解的风险点\n\n" +
			"**请分享这些信息，我会为您提供专业的合同分析！**"
	} else {
		// 问题已经详细，直接提供建议
		response = "## 📋 合同分析建议\n\n" +
			"基于您提供的信息，我为您分析如下：\n\n"

		if deepThinking {
			response += "## 🧠 深度分析\n\n" +
				"**关键条款检查**：\n" +
				"- **工作内容**：岗位职责、工作地点\n" +
				"- **薪资待遇**：基本工资、绩效奖金、福利\n" +
				"- **工作时间**：标准工时、加班费、假期\n" +
				"- **试用期**：长度、薪资、转正条件\n\n" +
				"**风险点识别**：\n" +
				"- 竞业限制是否合理\n" +
				"- 保密协议范围\n" +
				"- 违约金设置\n" +
				"- 解除合同条件\n\n" +
				"**修改建议**：\n" +
				"- [ ] 明确薪资结构\n" +
				"- [ ] 规范工作时间\n" +
				"- [ ] 合理试用期\n" +
				"- [ ] 确保社保缴纳"
		} else {
			response += "## ⚠️ 风险提醒\n\n" +
				"**核心检查**：\n" +
				"- **薪资结构**：基本工资、绩效、福利\n" +
				"- **工作时间**：标准工时、加班费\n" +
				"- **试用期**：长度、薪资标准\n" +
				"- **权益保护**：社保、假期、培训\n\n" +
				"**常见陷阱**：\n" +
				"1. 试用期过长（>6个月）\n" +
				"2. 薪资条款模糊\n" +
				"3. 加班费不明确\n" +
				"4. 违约金过高"
		}

		if networkSearch {
			response += "\n\n🌐 **最新信息**：\n" +
				"- 劳动法最新规定\n" +
				"- 行业合同标准\n" +
				"- 法律风险提醒"
		}
	}

	return response
}

// generateMonitorResponse 生成企业监控相关的回复
func generateMonitorResponse(input string, deepThinking, networkSearch bool) string {
	if deepThinking {
		return "## 🧠 深度分析\n\n" +
			"**监控维度**：\n" +
			"- **财务状况**：营收、利润、现金流、负债率\n" +
			"- **业务发展**：市场份额、产品发布、重大合作\n" +
			"- **管理层变动**：高管变动、战略调整\n" +
			"- **行业地位**：竞争对手、政策变化\n\n" +
			"**信息渠道**：\n" +
			"- 官方渠道：年报、公告、官网\n" +
			"- 媒体渠道：新闻、行业报告\n" +
			"- 专业平台：天眼查、企查查\n\n" +
			"**预警机制**：\n" +
			"- [ ] 设置关键指标阈值\n" +
			"- [ ] 建立定期报告制度\n" +
			"- [ ] 制定应急响应预案\n" +
			"- [ ] 建立信息验证机制"
	} else {
		return "## 企业监控建议\n\n" +
			"**核心监控**：\n" +
			"- **财务指标**：营收、利润、现金流\n" +
			"- **业务指标**：市场份额、客户数量\n" +
			"- **人员指标**：员工数量、离职率\n" +
			"- **风险指标**：法律诉讼、负面新闻\n\n" +
			"**风险预警**：\n" +
			"1. 财务风险：现金流紧张、债务违约\n" +
			"2. 经营风险：市场份额下降、客户流失\n" +
			"3. 法律风险：监管变化、诉讼增加\n\n" +
			"您最关心哪个方面？"
	}
}

// generateGeneralResponse 生成通用回复
func generateGeneralResponse(input string, deepThinking, networkSearch bool) string {
	return "## AI职场管家服务\n\n" +
		"**专业服务**：\n" +
		"- 🎯 **职业规划**：路径规划、技能提升\n" +
		"- 💰 **Offer分析**：薪资分析、谈判策略\n" +
		"- 📋 **合同检查**：条款解读、风险识别\n" +
		"- 🏢 **企业监控**：财务监控、风险预警\n\n" +
		"请选择服务类型，我将提供专业帮助！"
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

// generateDocumentSummary 生成文档摘要，避免完整内容回显
func generateDocumentSummary(content, docType string) string {
	// 限制摘要长度，避免过长
	maxLength := 500
	if len(content) <= maxLength {
		return content
	}

	// 根据文档类型生成不同的摘要
	switch docType {
	case "contract":
		return "劳动合同文档已上传，包含合同期限、工作内容、薪资待遇、福利保障、保密条款、竞业限制等关键信息。"
	case "offer":
		return "Offer文档已上传，包含职位信息、薪资结构、福利待遇、股权激励、入职条件等详细信息。"
	case "resume":
		return "简历文档已上传，包含个人信息、工作经历、教育背景、技能专长、项目经验等内容。"
	case "employment":
		return "在职证明文档已上传，包含公司信息、职位详情、工作职责、任职时间等关键信息。"
	default:
		return fmt.Sprintf("%s文档已上传，包含相关重要信息。", docType)
	}
}
