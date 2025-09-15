package models

import (
	"encoding/json"
	"time"
)

type BaseModel struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Message stores chat messages between user and AI agent
type Message struct {
	BaseModel
	UserID      string `json:"userId" gorm:"size:64;index"`
	Role        string `json:"role" gorm:"size:16;index"`
	Content     string `json:"content" gorm:"type:text"`
	ThreadID    string `json:"threadId" gorm:"size:64;index"`
	Attachments string `json:"attachments,omitempty" gorm:"type:text"`
}

// Note is a simple personal note item
type Note struct {
	BaseModel
	Title   string `json:"title" gorm:"size:255"`
	Content string `json:"content" gorm:"type:text"`
}

// UserProfile 用户档案
type UserProfile struct {
	BaseModel
	UserID       string `json:"userId" gorm:"size:64;uniqueIndex"`
	Nickname     string `json:"nickname" gorm:"size:100"`
	Email        string `json:"email" gorm:"size:255"`
	Phone        string `json:"phone" gorm:"size:20"`
	Industry     string `json:"industry" gorm:"size:100"`                                  // 行业
	Position     string `json:"position" gorm:"size:100"`                                  // 职位
	Experience   int    `json:"experience"`                                                // 工作年限
	Company      string `json:"company" gorm:"size:200"`                                   // 当前公司
	CareerStage  string `json:"careerStage" gorm:"size:50"`                                // 职业阶段
	DefaultModel string `json:"defaultModel" gorm:"size:100;default:'bailian/qwen-flash'"` // 默认选择的模型
	Preferences  string `json:"preferences" gorm:"type:text"`                              // 偏好设置(JSON)
}

// CareerHistory 职业规划历史记录
type CareerHistory struct {
	BaseModel
	UserID       string `json:"userId" gorm:"size:64;index"`
	ThreadID     string `json:"threadId" gorm:"size:64;index"`
	Category     string `json:"category" gorm:"size:50"`     // career, offer, contract, monitor
	Title        string `json:"title" gorm:"size:200"`       // 问题标题
	Content      string `json:"content" gorm:"type:text"`    // 问题内容
	AIResponse   string `json:"aiResponse" gorm:"type:text"` // AI回复
	ModelID      string `json:"modelId" gorm:"size:100"`     // 使用的模型
	Tags         string `json:"tags" gorm:"size:500"`        // 标签(JSON数组)
	Rating       int    `json:"rating"`                      // 用户评分 1-5
	IsBookmarked bool   `json:"isBookmarked"`                // 是否收藏
	Metadata     string `json:"metadata" gorm:"type:text"`   // 额外元数据(JSON)
}

// ContractRisk 劳动合同风险点
type ContractRisk struct {
	BaseModel
	UserID      string     `json:"userId" gorm:"size:64;index"`
	ThreadID    string     `json:"threadId" gorm:"size:64;index"`
	CompanyName string     `json:"companyName" gorm:"size:200"`
	RiskType    string     `json:"riskType" gorm:"size:50"`      // 风险类型
	RiskLevel   string     `json:"riskLevel" gorm:"size:20"`     // 风险等级: low, medium, high, critical
	RiskPoint   string     `json:"riskPoint" gorm:"size:200"`    // 风险点描述
	RiskDetail  string     `json:"riskDetail" gorm:"type:text"`  // 风险详情
	Suggestions string     `json:"suggestions" gorm:"type:text"` // 建议措施
	IsResolved  bool       `json:"isResolved"`                   // 是否已解决
	ResolvedAt  *time.Time `json:"resolvedAt"`                   // 解决时间
	ResolveNote string     `json:"resolveNote" gorm:"type:text"` // 解决备注
}

// CompanyMonitor 企业监控
type CompanyMonitor struct {
	BaseModel
	UserID       string     `json:"userId" gorm:"size:64;index"`
	CompanyName  string     `json:"companyName" gorm:"size:200"`
	CompanyCode  string     `json:"companyCode" gorm:"size:50"`  // 公司代码/股票代码
	Industry     string     `json:"industry" gorm:"size:100"`    // 行业
	MonitorType  string     `json:"monitorType" gorm:"size:50"`  // 监控类型: financial, management, market
	AlertEmail   string     `json:"alertEmail" gorm:"size:255"`  // 告警邮箱
	AlertEnabled bool       `json:"alertEnabled"`                // 是否启用告警
	AlertRules   string     `json:"alertRules" gorm:"type:text"` // 告警规则(JSON)
	LastAlertAt  *time.Time `json:"lastAlertAt"`                 // 最后告警时间
	AlertCount   int        `json:"alertCount"`                  // 告警次数
	Status       string     `json:"status" gorm:"size:20"`       // 状态: active, paused, stopped
	Notes        string     `json:"notes" gorm:"type:text"`      // 备注
}

// CareerStage 职业阶段定义
type CareerStage struct {
	Stage       string `json:"stage"`       // 阶段名称
	Description string `json:"description"` // 阶段描述
	Skills      string `json:"skills"`      // 所需技能
	Goals       string `json:"goals"`       // 阶段目标
	Duration    string `json:"duration"`    // 预计时长
	Progress    int    `json:"progress"`    // 当前进度 0-100
}

// PersonalMetrics 个性化指标
type PersonalMetrics struct {
	BaseModel
	UserID          string    `json:"userId" gorm:"size:64;uniqueIndex"`
	CareerScore     int       `json:"careerScore"`                      // 职业发展评分 0-100
	SkillLevel      int       `json:"skillLevel"`                       // 技能水平评分 0-100
	MarketValue     int       `json:"marketValue"`                      // 市场价值评分 0-100
	RiskTolerance   int       `json:"riskTolerance"`                    // 风险承受能力 0-100
	LearningAbility int       `json:"learningAbility"`                  // 学习能力评分 0-100
	NetworkStrength int       `json:"networkStrength"`                  // 人脉网络强度 0-100
	WorkLifeBalance int       `json:"workLifeBalance"`                  // 工作生活平衡 0-100
	CareerGoals     string    `json:"careerGoals" gorm:"type:text"`     // 职业目标(JSON)
	SkillGaps       string    `json:"skillGaps" gorm:"type:text"`       // 技能缺口(JSON)
	ImprovementPlan string    `json:"improvementPlan" gorm:"type:text"` // 改进计划(JSON)
	LastUpdated     time.Time `json:"lastUpdated"`                      // 最后更新时间
}

// AlertRule 告警规则
type AlertRule struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Type        string `json:"type"`        // financial, management, market
	Condition   string `json:"condition"`   // 触发条件
	Threshold   string `json:"threshold"`   // 阈值
	Severity    string `json:"severity"`    // 严重程度
	Description string `json:"description"` // 规则描述
	Enabled     bool   `json:"enabled"`     // 是否启用
}

// UserDocument 用户文档
type UserDocument struct {
	BaseModel
	UserID           string `json:"userId" gorm:"size:64;index"`
	DocumentType     string `json:"documentType" gorm:"size:50"`                       // resume, contract, offer, employment, other
	FileName         string `json:"fileName" gorm:"size:255"`                          // 原始文件名
	FileSize         int64  `json:"fileSize"`                                          // 文件大小(字节)
	FileType         string `json:"fileType" gorm:"size:50"`                           // pdf, doc, docx, txt
	FilePath         string `json:"filePath" gorm:"size:500"`                          // 文件存储路径
	FileContent      string `json:"fileContent" gorm:"type:text"`                      // 文件内容(提取的文本)
	ExtractedInfo    string `json:"extractedInfo" gorm:"type:text"`                    // AI提取的结构化信息(JSON)
	UploadSource     string `json:"uploadSource" gorm:"size:50;default:'manual'"`      // manual, api, import
	IsProcessed      bool   `json:"isProcessed"`                                       // 是否已处理
	ProcessingStatus string `json:"processingStatus" gorm:"size:20;default:'pending'"` // pending, processing, completed, failed
	ProcessingError  string `json:"processingError" gorm:"type:text"`                  // 处理错误信息
	Tags             string `json:"tags" gorm:"size:500"`                              // 标签(JSON数组)
	Metadata         string `json:"metadata" gorm:"type:text"`                         // 额外元数据(JSON)
}

// DocumentExtractedInfo AI提取的文档信息
type DocumentExtractedInfo struct {
	// 简历信息
	PersonalInfo struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Location string `json:"location"`
		LinkedIn string `json:"linkedin"`
		GitHub   string `json:"github"`
	} `json:"personalInfo"`

	// 工作经历
	WorkExperience []struct {
		Company     string   `json:"company"`
		Position    string   `json:"position"`
		Duration    string   `json:"duration"`
		Description string   `json:"description"`
		Skills      []string `json:"skills"`
	} `json:"workExperience"`

	// 教育背景
	Education []struct {
		School   string `json:"school"`
		Degree   string `json:"degree"`
		Major    string `json:"major"`
		Duration string `json:"duration"`
		GPA      string `json:"gpa"`
	} `json:"education"`

	// 技能
	Skills struct {
		Technical      []string `json:"technical"`
		Soft           []string `json:"soft"`
		Languages      []string `json:"languages"`
		Certifications []string `json:"certifications"`
	} `json:"skills"`

	// 合同信息
	ContractInfo struct {
		CompanyName     string   `json:"companyName"`
		Position        string   `json:"position"`
		Salary          string   `json:"salary"`
		StartDate       string   `json:"startDate"`
		ContractType    string   `json:"contractType"`
		WorkLocation    string   `json:"workLocation"`
		WorkingHours    string   `json:"workingHours"`
		Benefits        []string `json:"benefits"`
		NoticePeriod    string   `json:"noticePeriod"`
		NonCompete      string   `json:"nonCompete"`
		Confidentiality string   `json:"confidentiality"`
	} `json:"contractInfo"`

	// Offer信息
	OfferInfo struct {
		CompanyName  string   `json:"companyName"`
		Position     string   `json:"position"`
		Salary       string   `json:"salary"`
		Bonus        string   `json:"bonus"`
		Equity       string   `json:"equity"`
		StartDate    string   `json:"startDate"`
		Benefits     []string `json:"benefits"`
		WorkLocation string   `json:"workLocation"`
		WorkingHours string   `json:"workingHours"`
		ReportingTo  string   `json:"reportingTo"`
		TeamSize     string   `json:"teamSize"`
	} `json:"offerInfo"`

	// 在职情况
	EmploymentInfo struct {
		CompanyName      string   `json:"companyName"`
		Position         string   `json:"position"`
		Department       string   `json:"department"`
		Manager          string   `json:"manager"`
		TeamSize         string   `json:"teamSize"`
		Responsibilities []string `json:"responsibilities"`
		Achievements     []string `json:"achievements"`
		SkillsUsed       []string `json:"skillsUsed"`
		Projects         []string `json:"projects"`
	} `json:"employmentInfo"`
}

// 辅助方法
func (p *UserProfile) GetPreferences() map[string]interface{} {
	var prefs map[string]interface{}
	if p.Preferences != "" {
		json.Unmarshal([]byte(p.Preferences), &prefs)
	}
	return prefs
}

func (p *UserProfile) SetPreferences(prefs map[string]interface{}) error {
	data, err := json.Marshal(prefs)
	if err != nil {
		return err
	}
	p.Preferences = string(data)
	return nil
}

func (ch *CareerHistory) GetTags() []string {
	var tags []string
	if ch.Tags != "" {
		json.Unmarshal([]byte(ch.Tags), &tags)
	}
	return tags
}

func (ch *CareerHistory) SetTags(tags []string) error {
	data, err := json.Marshal(tags)
	if err != nil {
		return err
	}
	ch.Tags = string(data)
	return nil
}

func (cm *CompanyMonitor) GetAlertRules() []AlertRule {
	var rules []AlertRule
	if cm.AlertRules != "" {
		json.Unmarshal([]byte(cm.AlertRules), &rules)
	}
	return rules
}

func (cm *CompanyMonitor) SetAlertRules(rules []AlertRule) error {
	data, err := json.Marshal(rules)
	if err != nil {
		return err
	}
	cm.AlertRules = string(data)
	return nil
}

func (ud *UserDocument) GetExtractedInfo() (*DocumentExtractedInfo, error) {
	var info DocumentExtractedInfo
	if ud.ExtractedInfo != "" {
		err := json.Unmarshal([]byte(ud.ExtractedInfo), &info)
		if err != nil {
			return nil, err
		}
	}
	return &info, nil
}

func (ud *UserDocument) SetExtractedInfo(info *DocumentExtractedInfo) error {
	data, err := json.Marshal(info)
	if err != nil {
		return err
	}
	ud.ExtractedInfo = string(data)
	return nil
}

func (ud *UserDocument) GetTags() []string {
	var tags []string
	if ud.Tags != "" {
		json.Unmarshal([]byte(ud.Tags), &tags)
	}
	return tags
}

func (ud *UserDocument) SetTags(tags []string) error {
	data, err := json.Marshal(tags)
	if err != nil {
		return err
	}
	ud.Tags = string(data)
	return nil
}

func (ud *UserDocument) GetMetadata() map[string]interface{} {
	var metadata map[string]interface{}
	if ud.Metadata != "" {
		json.Unmarshal([]byte(ud.Metadata), &metadata)
	}
	return metadata
}

func (ud *UserDocument) SetMetadata(metadata map[string]interface{}) error {
	data, err := json.Marshal(metadata)
	if err != nil {
		return err
	}
	ud.Metadata = string(data)
	return nil
}
