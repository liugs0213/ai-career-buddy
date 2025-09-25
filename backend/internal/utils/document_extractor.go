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
你是一位专业的招聘顾问，请从以下简历内容中提取结构化信息，并以JSON格式返回。

简历内容：
%s

请仔细分析并提取以下信息：

1. 个人信息：
   - 姓名、邮箱、电话、地址
   - LinkedIn、GitHub、个人网站等社交媒体链接
   - 年龄、性别（如果明确提及）

2. 工作经历：
   - 公司名称、职位、工作时间（精确到月份）
   - 工作描述、主要职责
   - 使用的技能、技术栈
   - 项目经验、团队规模
   - 工作成果、业绩数据

3. 教育背景：
   - 学校名称、学位、专业
   - 入学和毕业时间
   - GPA、排名（如果提及）
   - 相关课程、学术成就

4. 技能评估：
   - 技术技能：编程语言、框架、工具等
   - 软技能：沟通、领导力、团队合作等
   - 语言能力：中文、英文等语言水平
   - 证书：专业认证、培训证书等

5. 项目经验：
   - 项目名称、项目描述
   - 使用的技术、工具
   - 项目规模、团队角色
   - 项目成果、影响

6. 职业发展分析：
   - 职业发展方向
   - 技能匹配度
   - 潜在优势
   - 需要改进的方面

请严格按照以下JSON格式返回，确保所有字段都有值（如果信息不存在，请填写"未提供"或空数组）：
{
  "personalInfo": {
    "name": "姓名",
    "email": "邮箱",
    "phone": "电话",
    "location": "地址",
    "linkedin": "LinkedIn链接",
    "github": "GitHub链接",
    "website": "个人网站",
    "age": "年龄",
    "gender": "性别"
  },
  "workExperience": [
    {
      "company": "公司名称",
      "position": "职位",
      "duration": "工作时间",
      "description": "工作描述",
      "skills": ["技能1", "技能2"],
      "teamSize": "团队规模",
      "achievements": ["成就1", "成就2"]
    }
  ],
  "education": [
    {
      "school": "学校名称",
      "degree": "学位",
      "major": "专业",
      "duration": "时间",
      "gpa": "GPA",
      "achievements": ["学术成就"]
    }
  ],
  "skills": {
    "technical": ["技术技能"],
    "soft": ["软技能"],
    "languages": ["语言"],
    "certifications": ["证书"]
  },
  "projects": [
    {
      "name": "项目名称",
      "description": "项目描述",
      "technologies": ["技术1", "技术2"],
      "role": "角色",
      "duration": "项目时间",
      "achievements": ["项目成果"]
    }
  ],
  "careerAnalysis": {
    "direction": "职业发展方向",
    "strengths": ["优势1", "优势2"],
    "weaknesses": ["需要改进的方面"],
    "recommendations": ["建议1", "建议2"]
  }
}

注意：
1. 请仔细阅读简历内容，确保信息提取的准确性
2. 对于时间信息，请尽量保持原始格式
3. 技能信息请尽量详细和具体
4. 如果某些信息不明确，请合理推断或标记为"未提供"
5. 职业分析部分请基于简历内容给出专业建议
6. 如果简历格式不够清晰，建议用户使用.md格式重新上传，以便获得更准确的分析结果
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
你是一位专业的HR和法律顾问，请从以下劳动合同内容中提取关键信息，并以JSON格式返回。

合同内容：
%s

请仔细分析并提取以下信息：

1. 基本信息：
   - 公司名称、职位、工作地点
   - 合同类型（正式/实习/外包/劳务派遣等）
   - 入职日期、合同期限

2. 薪资待遇：
   - 基本工资、绩效工资、奖金
   - 薪资结构、发放方式
   - 试用期薪资

3. 工作条件：
   - 工作时间、休息日安排
   - 工作地点、出差要求
   - 加班政策

4. 福利待遇：
   - 社会保险、住房公积金
   - 年假、病假、其他假期
   - 培训机会、职业发展

5. 风险条款：
   - 离职通知期、违约金
   - 竞业限制条款
   - 保密条款、知识产权
   - 其他限制性条款

请严格按照以下JSON格式返回：
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

注意：
1. 请仔细阅读合同条款，确保信息提取的准确性
2. 对于风险条款，请特别关注可能对求职者不利的条款
3. 薪资信息请尽量详细，包括各种组成部分
4. 如果某些信息不明确，请标记为"未明确"或"待确认"
5. 如果合同格式不够清晰，建议用户使用.md格式重新上传，以便获得更准确的分析结果
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
你是一位专业的招聘顾问和薪酬专家，请从以下Offer内容中提取关键信息，并以JSON格式返回。

Offer内容：
%s

请仔细分析并提取以下信息：

1. 基本信息：
   - 公司名称、职位、部门
   - 汇报对象、团队规模
   - 入职日期、试用期

2. 薪酬结构：
   - 基本工资、绩效工资、奖金
   - 股权/期权、股票激励
   - 薪资调整机制

3. 福利待遇：
   - 社会保险、住房公积金
   - 年假、病假、其他假期
   - 培训机会、职业发展
   - 其他特殊福利

4. 工作条件：
   - 工作地点、办公环境
   - 工作时间、弹性工作
   - 出差要求、远程工作

5. 职业发展：
   - 晋升通道、发展机会
   - 培训计划、技能提升
   - 职业规划支持

请严格按照以下JSON格式返回：
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

注意：
1. 请仔细阅读Offer内容，确保信息提取的准确性
2. 对于薪酬信息，请尽量详细，包括各种组成部分
3. 如果某些信息不明确，请标记为"未明确"或"待确认"
4. 如果Offer格式不够清晰，建议用户使用.md格式重新上传，以便获得更准确的分析结果
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
你是一位专业的职业发展顾问，请从以下在职情况描述中提取关键信息，并以JSON格式返回。

在职情况内容：
%s

请仔细分析并提取以下信息：

1. 基本信息：
   - 公司名称、职位、部门
   - 直属领导、团队规模
   - 入职时间、工作年限

2. 工作职责：
   - 主要工作内容
   - 负责的项目和任务
   - 管理职责（如果有）

3. 主要成就：
   - 工作成果和业绩
   - 项目成功案例
   - 获得的认可和奖励

4. 使用的技能：
   - 技术技能、工具使用
   - 软技能、管理能力
   - 行业知识

5. 参与的项目：
   - 项目名称、项目描述
   - 项目规模、团队角色
   - 项目成果、影响

6. 职业发展：
   - 当前职业阶段
   - 发展方向和目标
   - 技能提升计划

请严格按照以下JSON格式返回：
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

注意：
1. 请仔细阅读在职情况内容，确保信息提取的准确性
2. 对于成就和项目，请尽量详细和具体
3. 如果某些信息不明确，请标记为"未明确"或"待确认"
4. 如果在职情况描述格式不够清晰，建议用户使用.md格式重新上传，以便获得更准确的分析结果
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
你是一位专业的文档分析师，请从以下文档内容中提取关键信息，并以JSON格式返回。

文档内容：
%s

请仔细分析并提取以下信息：

1. 文档类型识别：
   - 判断文档的主要类型（简历、合同、Offer、报告等）
   - 识别文档的用途和目标

2. 主要内容：
   - 文档的核心主题
   - 主要信息和数据
   - 关键观点和结论

3. 关键信息：
   - 重要的人物、时间、地点
   - 关键数据和指标
   - 重要的条款和条件

4. 相关技能：
   - 技术技能、专业能力
   - 软技能、管理能力
   - 行业知识和经验

5. 时间信息：
   - 时间节点、期限
   - 历史信息、计划安排
   - 重要日期

6. 人员信息：
   - 相关人员、联系人
   - 组织架构、团队信息
   - 角色和职责

请严格按照以下JSON格式返回：
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

注意：
1. 请仔细阅读文档内容，确保信息提取的准确性
2. 对于关键信息，请尽量详细和具体
3. 如果某些信息不明确，请标记为"未明确"或"待确认"
4. 如果文档格式不够清晰，建议用户使用.md格式重新上传，以便获得更准确的分析结果
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
