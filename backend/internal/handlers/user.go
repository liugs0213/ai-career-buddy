package handlers

import (
	"net/http"
	"strconv"
	"time"

	"ai-career-buddy/internal/db"
	"ai-career-buddy/internal/logger"
	"ai-career-buddy/internal/models"

	"github.com/gin-gonic/gin"
)

// GetUserProfile 获取用户档案
func GetUserProfile(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户ID不能为空"})
		return
	}

	var profile models.UserProfile
	if err := db.Conn.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		logger.Warn("用户档案不存在: UserID=%s", userID)
		c.JSON(http.StatusNotFound, gin.H{"error": "用户档案不存在"})
		return
	}

	logger.Info("获取用户档案: UserID=%s", userID)
	c.JSON(http.StatusOK, profile)
}

// UpdateUserProfile 更新用户档案
func UpdateUserProfile(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户ID不能为空"})
		return
	}

	var profile models.UserProfile
	if err := c.ShouldBindJSON(&profile); err != nil {
		logger.Error("用户档案更新请求解析失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profile.UserID = userID
	profile.UpdatedAt = time.Now()

	if err := db.Conn.Save(&profile).Error; err != nil {
		logger.Error("更新用户档案失败: UserID=%s, 错误=%v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	logger.Info("用户档案更新成功: UserID=%s", userID)
	c.JSON(http.StatusOK, profile)
}

// GetCareerHistory 获取职业规划历史记录
func GetCareerHistory(c *gin.Context) {
	userID := c.Param("userId")
	category := c.Query("category") // career, offer, contract, monitor
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	if limit > 100 {
		limit = 100
	}

	var histories []models.CareerHistory
	query := db.Conn.Where("user_id = ?", userID)

	if category != "" {
		// 兼容处理：同时查询 category 和 category- 的情况
		query = query.Where("category = ? OR category = ?", category, category+"-")
	}

	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&histories).Error; err != nil {
		logger.Error("获取职业历史记录失败: UserID=%s, 错误=%v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取失败"})
		return
	}

	logger.Info("获取职业历史记录: UserID=%s, Category=%s, 数量=%d", userID, category, len(histories))
	c.JSON(http.StatusOK, gin.H{"histories": histories})
}

// SaveCareerHistory 保存职业规划历史记录
func SaveCareerHistory(c *gin.Context) {
	var history models.CareerHistory
	if err := c.ShouldBindJSON(&history); err != nil {
		logger.Error("职业历史记录保存请求解析失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	history.CreatedAt = time.Now()
	history.UpdatedAt = time.Now()

	if err := db.Conn.Create(&history).Error; err != nil {
		logger.Error("保存职业历史记录失败: UserID=%s, 错误=%v", history.UserID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存失败"})
		return
	}

	logger.Info("职业历史记录保存成功: UserID=%s, Category=%s", history.UserID, history.Category)
	c.JSON(http.StatusOK, history)
}

// GetContractRisks 获取劳动合同风险点
func GetContractRisks(c *gin.Context) {
	userID := c.Param("userId")
	companyName := c.Query("companyName")
	resolved := c.Query("resolved") // true, false, all

	var risks []models.ContractRisk
	query := db.Conn.Where("user_id = ?", userID)

	if companyName != "" {
		query = query.Where("company_name = ?", companyName)
	}

	if resolved == "true" {
		query = query.Where("is_resolved = ?", true)
	} else if resolved == "false" {
		query = query.Where("is_resolved = ?", false)
	}

	if err := query.Order("created_at DESC").Find(&risks).Error; err != nil {
		logger.Error("获取合同风险点失败: UserID=%s, 错误=%v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取失败"})
		return
	}

	logger.Info("获取合同风险点: UserID=%s, 数量=%d", userID, len(risks))
	c.JSON(http.StatusOK, gin.H{"risks": risks})
}

// SaveContractRisk 保存劳动合同风险点
func SaveContractRisk(c *gin.Context) {
	var risk models.ContractRisk
	if err := c.ShouldBindJSON(&risk); err != nil {
		logger.Error("合同风险点保存请求解析失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	risk.CreatedAt = time.Now()
	risk.UpdatedAt = time.Now()

	if err := db.Conn.Create(&risk).Error; err != nil {
		logger.Error("保存合同风险点失败: UserID=%s, 错误=%v", risk.UserID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存失败"})
		return
	}

	logger.Info("合同风险点保存成功: UserID=%s, Company=%s, RiskLevel=%s",
		risk.UserID, risk.CompanyName, risk.RiskLevel)
	c.JSON(http.StatusOK, risk)
}

// UpdateContractRisk 更新劳动合同风险点
func UpdateContractRisk(c *gin.Context) {
	riskID := c.Param("riskId")

	var risk models.ContractRisk
	if err := c.ShouldBindJSON(&risk); err != nil {
		logger.Error("合同风险点更新请求解析失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	risk.ID = 0 // 防止ID被覆盖
	risk.UpdatedAt = time.Now()

	if err := db.Conn.Model(&models.ContractRisk{}).Where("id = ?", riskID).Updates(&risk).Error; err != nil {
		logger.Error("更新合同风险点失败: RiskID=%s, 错误=%v", riskID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	logger.Info("合同风险点更新成功: RiskID=%s", riskID)
	c.JSON(http.StatusOK, gin.H{"message": "更新成功"})
}

// GetCompanyMonitors 获取企业监控列表
func GetCompanyMonitors(c *gin.Context) {
	userID := c.Param("userId")
	status := c.Query("status") // active, paused, stopped

	var monitors []models.CompanyMonitor
	query := db.Conn.Where("user_id = ?", userID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("created_at DESC").Find(&monitors).Error; err != nil {
		logger.Error("获取企业监控列表失败: UserID=%s, 错误=%v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取失败"})
		return
	}

	logger.Info("获取企业监控列表: UserID=%s, 数量=%d", userID, len(monitors))
	c.JSON(http.StatusOK, gin.H{"monitors": monitors})
}

// SaveCompanyMonitor 保存企业监控
func SaveCompanyMonitor(c *gin.Context) {
	var monitor models.CompanyMonitor
	if err := c.ShouldBindJSON(&monitor); err != nil {
		logger.Error("企业监控保存请求解析失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	monitor.CreatedAt = time.Now()
	monitor.UpdatedAt = time.Now()
	monitor.Status = "active" // 默认状态

	if err := db.Conn.Create(&monitor).Error; err != nil {
		logger.Error("保存企业监控失败: UserID=%s, 错误=%v", monitor.UserID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存失败"})
		return
	}

	logger.Info("企业监控保存成功: UserID=%s, Company=%s", monitor.UserID, monitor.CompanyName)
	c.JSON(http.StatusOK, monitor)
}

// UpdateCompanyMonitor 更新企业监控
func UpdateCompanyMonitor(c *gin.Context) {
	monitorID := c.Param("monitorId")

	var monitor models.CompanyMonitor
	if err := c.ShouldBindJSON(&monitor); err != nil {
		logger.Error("企业监控更新请求解析失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	monitor.ID = 0 // 防止ID被覆盖
	monitor.UpdatedAt = time.Now()

	if err := db.Conn.Model(&models.CompanyMonitor{}).Where("id = ?", monitorID).Updates(&monitor).Error; err != nil {
		logger.Error("更新企业监控失败: MonitorID=%s, 错误=%v", monitorID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	logger.Info("企业监控更新成功: MonitorID=%s", monitorID)
	c.JSON(http.StatusOK, gin.H{"message": "更新成功"})
}

// GetPersonalMetrics 获取个性化指标
func GetPersonalMetrics(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户ID不能为空"})
		return
	}

	var metrics models.PersonalMetrics
	if err := db.Conn.Where("user_id = ?", userID).First(&metrics).Error; err != nil {
		logger.Warn("个性化指标不存在: UserID=%s", userID)
		c.JSON(http.StatusNotFound, gin.H{"error": "个性化指标不存在"})
		return
	}

	logger.Info("获取个性化指标: UserID=%s", userID)
	c.JSON(http.StatusOK, metrics)
}

// UpdatePersonalMetrics 更新个性化指标
func UpdatePersonalMetrics(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户ID不能为空"})
		return
	}

	var metrics models.PersonalMetrics
	if err := c.ShouldBindJSON(&metrics); err != nil {
		logger.Error("个性化指标更新请求解析失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	metrics.UserID = userID
	metrics.LastUpdated = time.Now()
	metrics.UpdatedAt = time.Now()

	if err := db.Conn.Save(&metrics).Error; err != nil {
		logger.Error("更新个性化指标失败: UserID=%s, 错误=%v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	logger.Info("个性化指标更新成功: UserID=%s", userID)
	c.JSON(http.StatusOK, metrics)
}

// GetCareerStages 获取职业阶段定义
func GetCareerStages(c *gin.Context) {
	stages := []models.CareerStage{
		{
			Stage:       "职场新人",
			Description: "刚进入职场，学习基础技能",
			Skills:      "基础技能、沟通能力、学习能力",
			Goals:       "快速适应工作环境，掌握基本技能",
			Duration:    "1-2年",
			Progress:    0,
		},
		{
			Stage:       "技能提升",
			Description: "专业技能快速提升期",
			Skills:      "专业技能、项目管理、团队协作",
			Goals:       "成为团队核心成员，承担重要项目",
			Duration:    "2-3年",
			Progress:    0,
		},
		{
			Stage:       "专业专家",
			Description: "在专业领域有一定影响力",
			Skills:      "深度专业技能、领导力、行业洞察",
			Goals:       "成为行业专家，指导他人",
			Duration:    "3-5年",
			Progress:    0,
		},
		{
			Stage:       "管理转型",
			Description: "从专业向管理转型",
			Skills:      "管理技能、战略思维、人员管理",
			Goals:       "带领团队，制定战略",
			Duration:    "5-8年",
			Progress:    0,
		},
		{
			Stage:       "高级管理",
			Description: "高级管理层",
			Skills:      "高级管理、战略规划、商业洞察",
			Goals:       "制定公司战略，影响行业发展",
			Duration:    "8年以上",
			Progress:    0,
		},
	}

	logger.Info("获取职业阶段定义")
	c.JSON(http.StatusOK, gin.H{"stages": stages})
}

// UpdateUserDefaultModel 更新用户默认模型
func UpdateUserDefaultModel(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户ID不能为空"})
		return
	}

	var request struct {
		DefaultModel string `json:"defaultModel" binding:"required"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		logger.Error("默认模型更新请求解析失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 检查用户档案是否存在，如果不存在则创建
	var profile models.UserProfile
	if err := db.Conn.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		// 用户档案不存在，创建新的
		profile = models.UserProfile{
			UserID:       userID,
			DefaultModel: request.DefaultModel,
		}
		if err := db.Conn.Create(&profile).Error; err != nil {
			logger.Error("创建用户档案失败: UserID=%s, 错误=%v", userID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
			return
		}
	} else {
		// 更新现有用户档案
		profile.DefaultModel = request.DefaultModel
		profile.UpdatedAt = time.Now()
		if err := db.Conn.Save(&profile).Error; err != nil {
			logger.Error("更新用户默认模型失败: UserID=%s, 错误=%v", userID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
			return
		}
	}

	logger.Info("用户默认模型更新成功: UserID=%s, Model=%s", userID, request.DefaultModel)
	c.JSON(http.StatusOK, gin.H{
		"message":      "默认模型更新成功",
		"defaultModel": profile.DefaultModel,
	})
}

// GetUserDefaultModel 获取用户默认模型
func GetUserDefaultModel(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户ID不能为空"})
		return
	}

	var profile models.UserProfile
	if err := db.Conn.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		// 用户档案不存在，返回默认模型
		logger.Warn("用户档案不存在，返回默认模型: UserID=%s", userID)
		c.JSON(http.StatusOK, gin.H{
			"defaultModel": "bailian/qwen-flash",
			"isDefault":    true,
		})
		return
	}

	logger.Info("获取用户默认模型: UserID=%s, Model=%s", userID, profile.DefaultModel)
	c.JSON(http.StatusOK, gin.H{
		"defaultModel": profile.DefaultModel,
		"isDefault":    false,
	})
}
