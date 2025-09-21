package utils

import (
	"encoding/json"
	"fmt"
	"strings"

	"ai-career-buddy/internal/api"
	"ai-career-buddy/internal/logger"
	"ai-career-buddy/internal/models"
)

// DocumentExtractor AI文档信息提取器
type DocumentExtractor struct {
	bailianClient *api.BailianClient
}

// NewDocumentExtractor 创建文档提取器
func NewDocumentExtractor() *DocumentExtractor {
	return &DocumentExtractor{
		bailianClient: api.NewBailianClient(),
	}
}

// cleanJSONContent 清理AI返回的JSON内容，移除markdown代码块标记等
func cleanJSONContent(content string) string {
	// 移除首尾空白
	content = strings.TrimSpace(content)

	// 移除markdown代码块标记
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")

	// 移除首尾空白
	content = strings.TrimSpace(content)

	// 查找JSON对象的开始和结束位置
	start := strings.Index(content, "{")
	end := strings.LastIndex(content, "}")

	if start != -1 && end != -1 && end > start {
		content = content[start : end+1]
	}

	return content
}

// ExtractDocumentInfo 提取文档信息
func (de *DocumentExtractor) ExtractDocumentInfo(document *models.UserDocument) (*models.DocumentExtractedInfo, error) {
	if document.FileContent == "" {
		return nil, fmt.Errorf("文档内容为空")
	}

	// 根据文档类型选择不同的提取策略
	switch document.DocumentType {
	case "resume":
		return de.extractResumeInfo(document)
	case "contract":
		return de.extractContractInfo(document)
	case "offer":
		return de.extractOfferInfo(document)
	case "employment":
		return de.extractEmploymentInfo(document)
	default:
		return de.extractGeneralInfo(document)
	}
}

// extractResumeInfo 提取简历信息
func (de *DocumentExtractor) extractResumeInfo(document *models.UserDocument) (*models.DocumentExtractedInfo, error) {
	prompt := fmt.Sprintf(`
请从以下简历内容中提取结构化信息，并以JSON格式返回：

简历内容：
%s

请提取以下信息：
1. 个人信息：姓名、邮箱、电话、地址、LinkedIn、GitHub等
2. 工作经历：公司名称、职位、工作时间、工作描述、使用的技能等
3. 教育背景：学校、学位、专业、时间、GPA等
4. 技能：技术技能、软技能、语言、证书等

请以以下JSON格式返回：
{
  "personalInfo": {
    "name": "姓名",
    "email": "邮箱",
    "phone": "电话",
    "location": "地址",
    "linkedin": "LinkedIn链接",
    "github": "GitHub链接"
  },
  "workExperience": [
    {
      "company": "公司名称",
      "position": "职位",
      "duration": "工作时间",
      "description": "工作描述",
      "skills": ["技能1", "技能2"]
    }
  ],
  "education": [
    {
      "school": "学校名称",
      "degree": "学位",
      "major": "专业",
      "duration": "时间",
      "gpa": "GPA"
    }
  ],
  "skills": {
    "technical": ["技术技能"],
    "soft": ["软技能"],
    "languages": ["语言"],
    "certifications": ["证书"]
  }
}
`, document.FileContent)

	response, err := de.bailianClient.SendMessage("bailian/qwen-flash", prompt, []string{})
	if err != nil {
		logger.Error("AI提取简历信息失败: %v", err)
		return nil, err
	}

	var extractedInfo models.DocumentExtractedInfo
	if len(response.Choices) > 0 {
		content := response.Choices[0].Message.Content
		logger.Info("AI返回的简历信息内容: %s", content)

		// 清理内容，移除可能的markdown代码块标记
		cleanedContent := cleanJSONContent(content)
		logger.Info("清理后的内容: %s", cleanedContent)

		if err := json.Unmarshal([]byte(cleanedContent), &extractedInfo); err != nil {
			logger.Error("解析简历信息失败: %v, 内容: %s", err, cleanedContent)
			return nil, fmt.Errorf("解析简历信息失败: %v", err)
		}
	} else {
		return nil, fmt.Errorf("AI响应为空")
	}

	return &extractedInfo, nil
}

// extractContractInfo 提取合同信息
func (de *DocumentExtractor) extractContractInfo(document *models.UserDocument) (*models.DocumentExtractedInfo, error) {
	prompt := fmt.Sprintf(`
请从以下劳动合同内容中提取关键信息，并以JSON格式返回：

合同内容：
%s

请提取以下信息：
1. 公司名称
2. 职位
3. 薪资待遇
4. 入职日期
5. 合同类型（正式/实习/外包等）
6. 工作地点
7. 工作时间
8. 福利待遇
9. 离职通知期
10. 竞业限制条款
11. 保密条款

请以以下JSON格式返回：
{
  "contractInfo": {
    "companyName": "公司名称",
    "position": "职位",
    "salary": "薪资",
    "startDate": "入职日期",
    "contractType": "合同类型",
    "workLocation": "工作地点",
    "workingHours": "工作时间",
    "benefits": ["福利1", "福利2"],
    "noticePeriod": "离职通知期",
    "nonCompete": "竞业限制",
    "confidentiality": "保密条款"
  }
}
`, document.FileContent)

	response, err := de.bailianClient.SendMessage("bailian/qwen-plus", prompt, []string{})
	if err != nil {
		logger.Error("AI提取合同信息失败: %v", err)
		return nil, err
	}

	var extractedInfo models.DocumentExtractedInfo
	if len(response.Choices) > 0 {
		content := response.Choices[0].Message.Content
		logger.Info("AI返回的合同信息内容: %s", content)

		// 清理内容，移除可能的markdown代码块标记
		cleanedContent := cleanJSONContent(content)
		logger.Info("清理后的内容: %s", cleanedContent)

		if err := json.Unmarshal([]byte(cleanedContent), &extractedInfo); err != nil {
			logger.Error("解析合同信息失败: %v, 内容: %s", err, cleanedContent)
			return nil, fmt.Errorf("解析合同信息失败: %v", err)
		}
	} else {
		return nil, fmt.Errorf("AI响应为空")
	}

	return &extractedInfo, nil
}

// extractOfferInfo 提取Offer信息
func (de *DocumentExtractor) extractOfferInfo(document *models.UserDocument) (*models.DocumentExtractedInfo, error) {
	prompt := fmt.Sprintf(`
请从以下Offer内容中提取关键信息，并以JSON格式返回：

Offer内容：
%s

请提取以下信息：
1. 公司名称
2. 职位
3. 薪资待遇
4. 奖金
5. 股权/期权
6. 入职日期
7. 福利待遇
8. 工作地点
9. 工作时间
10. 汇报对象
11. 团队规模

请以以下JSON格式返回：
{
  "offerInfo": {
    "companyName": "公司名称",
    "position": "职位",
    "salary": "薪资",
    "bonus": "奖金",
    "equity": "股权",
    "startDate": "入职日期",
    "benefits": ["福利1", "福利2"],
    "workLocation": "工作地点",
    "workingHours": "工作时间",
    "reportingTo": "汇报对象",
    "teamSize": "团队规模"
  }
}
`, document.FileContent)

	response, err := de.bailianClient.SendMessage("bailian/qwen-flash", prompt, []string{})
	if err != nil {
		logger.Error("AI提取Offer信息失败: %v", err)
		return nil, err
	}

	var extractedInfo models.DocumentExtractedInfo
	if len(response.Choices) > 0 {
		content := response.Choices[0].Message.Content
		logger.Info("AI返回的Offer信息内容: %s", content)

		// 清理内容，移除可能的markdown代码块标记
		cleanedContent := cleanJSONContent(content)
		logger.Info("清理后的内容: %s", cleanedContent)

		if err := json.Unmarshal([]byte(cleanedContent), &extractedInfo); err != nil {
			logger.Error("解析Offer信息失败: %v, 内容: %s", err, cleanedContent)
			return nil, fmt.Errorf("解析Offer信息失败: %v", err)
		}
	} else {
		return nil, fmt.Errorf("AI响应为空")
	}

	return &extractedInfo, nil
}

// extractEmploymentInfo 提取在职情况信息
func (de *DocumentExtractor) extractEmploymentInfo(document *models.UserDocument) (*models.DocumentExtractedInfo, error) {
	prompt := fmt.Sprintf(`
请从以下在职情况描述中提取关键信息，并以JSON格式返回：

在职情况内容：
%s

请提取以下信息：
1. 公司名称
2. 职位
3. 部门
4. 直属领导
5. 团队规模
6. 工作职责
7. 主要成就
8. 使用的技能
9. 参与的项目

请以以下JSON格式返回：
{
  "employmentInfo": {
    "companyName": "公司名称",
    "position": "职位",
    "department": "部门",
    "manager": "直属领导",
    "teamSize": "团队规模",
    "responsibilities": ["职责1", "职责2"],
    "achievements": ["成就1", "成就2"],
    "skillsUsed": ["技能1", "技能2"],
    "projects": ["项目1", "项目2"]
  }
}
`, document.FileContent)

	response, err := de.bailianClient.SendMessage("bailian/qwen-flash", prompt, []string{})
	if err != nil {
		logger.Error("AI提取在职情况信息失败: %v", err)
		return nil, err
	}

	var extractedInfo models.DocumentExtractedInfo
	if len(response.Choices) > 0 {
		content := response.Choices[0].Message.Content
		logger.Info("AI返回的在职情况信息内容: %s", content)

		// 清理内容，移除可能的markdown代码块标记
		cleanedContent := cleanJSONContent(content)
		logger.Info("清理后的内容: %s", cleanedContent)

		if err := json.Unmarshal([]byte(cleanedContent), &extractedInfo); err != nil {
			logger.Error("解析在职情况信息失败: %v, 内容: %s", err, cleanedContent)
			return nil, fmt.Errorf("解析在职情况信息失败: %v", err)
		}
	} else {
		return nil, fmt.Errorf("AI响应为空")
	}

	return &extractedInfo, nil
}

// extractGeneralInfo 提取通用信息
func (de *DocumentExtractor) extractGeneralInfo(document *models.UserDocument) (*models.DocumentExtractedInfo, error) {
	prompt := fmt.Sprintf(`
请从以下文档内容中提取关键信息，并以JSON格式返回：

文档内容：
%s

请提取以下信息：
1. 文档类型
2. 主要内容
3. 关键信息
4. 相关技能
5. 时间信息
6. 人员信息

请以以下JSON格式返回：
{
  "generalInfo": {
    "documentType": "文档类型",
    "mainContent": "主要内容",
    "keyInfo": ["关键信息1", "关键信息2"],
    "skills": ["技能1", "技能2"],
    "timeInfo": ["时间信息1", "时间信息2"],
    "peopleInfo": ["人员信息1", "人员信息2"]
  }
}
`, document.FileContent)

	response, err := de.bailianClient.SendMessage("bailian/qwen-flash", prompt, []string{})
	if err != nil {
		logger.Error("AI提取通用信息失败: %v", err)
		return nil, err
	}

	var extractedInfo models.DocumentExtractedInfo
	if len(response.Choices) > 0 {
		content := response.Choices[0].Message.Content
		logger.Info("AI返回的通用信息内容: %s", content)

		// 清理内容，移除可能的markdown代码块标记
		cleanedContent := cleanJSONContent(content)
		logger.Info("清理后的内容: %s", cleanedContent)

		if err := json.Unmarshal([]byte(cleanedContent), &extractedInfo); err != nil {
			logger.Error("解析通用信息失败: %v, 内容: %s", err, cleanedContent)
			return nil, fmt.Errorf("解析通用信息失败: %v", err)
		}
	} else {
		return nil, fmt.Errorf("AI响应为空")
	}

	return &extractedInfo, nil
}

// GenerateVisualizationData 基于提取的信息生成可视化数据
func (de *DocumentExtractor) GenerateVisualizationData(extractedInfo *models.DocumentExtractedInfo, documentType string) (map[string]interface{}, error) {
	switch documentType {
	case "resume":
		return de.generateResumeVisualization(extractedInfo)
	case "contract":
		return de.generateContractVisualization(extractedInfo)
	case "offer":
		return de.generateOfferVisualization(extractedInfo)
	case "employment":
		return de.generateEmploymentVisualization(extractedInfo)
	default:
		return de.generateGeneralVisualization(extractedInfo)
	}
}

// generateResumeVisualization 生成简历可视化数据
func (de *DocumentExtractor) generateResumeVisualization(extractedInfo *models.DocumentExtractedInfo) (map[string]interface{}, error) {
	// 生成技能树数据
	skillTreeData := map[string]interface{}{
		"technical":      extractedInfo.Skills.Technical,
		"soft":           extractedInfo.Skills.Soft,
		"languages":      extractedInfo.Skills.Languages,
		"certifications": extractedInfo.Skills.Certifications,
	}

	// 生成时间线数据
	timelineData := []map[string]interface{}{}
	for _, exp := range extractedInfo.WorkExperience {
		timelineData = append(timelineData, map[string]interface{}{
			"title":       exp.Position,
			"company":     exp.Company,
			"duration":    exp.Duration,
			"description": exp.Description,
			"skills":      exp.Skills,
		})
	}

	// 生成思维导图数据
	mindMapData := map[string]interface{}{
		"name": extractedInfo.PersonalInfo.Name,
		"children": []map[string]interface{}{
			{
				"name": "个人信息",
				"children": []map[string]interface{}{
					{"name": "邮箱: " + extractedInfo.PersonalInfo.Email},
					{"name": "电话: " + extractedInfo.PersonalInfo.Phone},
					{"name": "地址: " + extractedInfo.PersonalInfo.Location},
				},
			},
			{
				"name":     "工作经历",
				"children": timelineData,
			},
			{
				"name": "技能",
				"children": []map[string]interface{}{
					{"name": "技术技能", "children": skillTreeData["technical"]},
					{"name": "软技能", "children": skillTreeData["soft"]},
				},
			},
		},
	}

	return map[string]interface{}{
		"skillTree": skillTreeData,
		"timeline":  timelineData,
		"mindMap":   mindMapData,
	}, nil
}

// generateContractVisualization 生成合同可视化数据
func (de *DocumentExtractor) generateContractVisualization(extractedInfo *models.DocumentExtractedInfo) (map[string]interface{}, error) {
	contractInfo := extractedInfo.ContractInfo

	// 生成合同风险分析
	riskAnalysis := map[string]interface{}{
		"companyName": contractInfo.CompanyName,
		"position":    contractInfo.Position,
		"salary":      contractInfo.Salary,
		"benefits":    contractInfo.Benefits,
		"risks": []map[string]interface{}{
			{
				"type":    "竞业限制",
				"content": contractInfo.NonCompete,
				"level":   "medium",
			},
			{
				"type":    "保密条款",
				"content": contractInfo.Confidentiality,
				"level":   "high",
			},
		},
	}

	// 生成合同流程图
	flowData := []map[string]interface{}{
		{"step": 1, "title": "合同签署", "description": "签署劳动合同"},
		{"step": 2, "title": "入职准备", "description": "准备入职材料"},
		{"step": 3, "title": "正式入职", "description": "开始工作"},
		{"step": 4, "title": "试用期", "description": "试用期考核"},
		{"step": 5, "title": "转正", "description": "正式员工"},
	}

	return map[string]interface{}{
		"riskAnalysis": riskAnalysis,
		"flowChart":    flowData,
	}, nil
}

// generateOfferVisualization 生成Offer可视化数据
func (de *DocumentExtractor) generateOfferVisualization(extractedInfo *models.DocumentExtractedInfo) (map[string]interface{}, error) {
	offerInfo := extractedInfo.OfferInfo

	// 生成Offer对比数据
	offerComparison := map[string]interface{}{
		"companyName":  offerInfo.CompanyName,
		"position":     offerInfo.Position,
		"salary":       offerInfo.Salary,
		"bonus":        offerInfo.Bonus,
		"equity":       offerInfo.Equity,
		"benefits":     offerInfo.Benefits,
		"workLocation": offerInfo.WorkLocation,
		"teamSize":     offerInfo.TeamSize,
	}

	// 生成决策流程图
	decisionFlow := []map[string]interface{}{
		{"step": 1, "title": "收到Offer", "description": "收到工作邀请"},
		{"step": 2, "title": "分析条件", "description": "分析薪资福利"},
		{"step": 3, "title": "对比选择", "description": "与其他机会对比"},
		{"step": 4, "title": "谈判协商", "description": "协商薪资条件"},
		{"step": 5, "title": "做出决定", "description": "接受或拒绝Offer"},
	}

	return map[string]interface{}{
		"offerComparison": offerComparison,
		"decisionFlow":    decisionFlow,
	}, nil
}

// generateEmploymentVisualization 生成在职情况可视化数据
func (de *DocumentExtractor) generateEmploymentVisualization(extractedInfo *models.DocumentExtractedInfo) (map[string]interface{}, error) {
	employmentInfo := extractedInfo.EmploymentInfo

	// 生成职业发展路径
	careerPath := []map[string]interface{}{
		{"stage": "当前职位", "position": employmentInfo.Position, "company": employmentInfo.CompanyName},
		{"stage": "下一阶段", "position": "高级" + employmentInfo.Position, "company": employmentInfo.CompanyName},
		{"stage": "未来目标", "position": "技术专家/管理岗位", "company": "目标公司"},
	}

	// 生成技能发展图
	skillDevelopment := map[string]interface{}{
		"currentSkills": employmentInfo.SkillsUsed,
		"targetSkills":  []string{"领导力", "战略思维", "团队管理"},
		"skillGaps":     []string{"项目管理", "商业分析"},
	}

	return map[string]interface{}{
		"careerPath":       careerPath,
		"skillDevelopment": skillDevelopment,
	}, nil
}

// generateGeneralVisualization 生成通用可视化数据
func (de *DocumentExtractor) generateGeneralVisualization(extractedInfo *models.DocumentExtractedInfo) (map[string]interface{}, error) {
	return map[string]interface{}{
		"documentType": "通用文档",
		"summary":      "文档内容摘要",
		"keyPoints":    []string{"关键点1", "关键点2", "关键点3"},
	}, nil
}
