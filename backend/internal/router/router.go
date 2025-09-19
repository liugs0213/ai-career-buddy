package router

import (
	"ai-career-buddy/internal/handlers"
	"ai-career-buddy/internal/middleware"

	"github.com/gin-gonic/gin"
)

func Setup() *gin.Engine {
	r := gin.New()

	// 添加中间件
	r.Use(middleware.CORSMiddleware()) // 添加CORS中间件
	r.Use(middleware.LoggingMiddleware())
	r.Use(middleware.ErrorRecoveryMiddleware())
	r.Use(gin.Recovery())

	r.GET("/health", handlers.Health)

	api := r.Group("/api")
	{
		// 消息相关
		api.GET("/messages", handlers.ListMessages)
		api.POST("/messages", handlers.SendMessage)
		api.POST("/messages/stream", handlers.StreamMessage)
		api.POST("/pdf/extract", handlers.ExtractPDFText)

		// 笔记相关
		api.GET("/notes", handlers.ListNotes)
		api.POST("/notes", handlers.CreateNote)
		api.PUT("/notes/:id", handlers.UpdateNote)
		api.DELETE("/notes/:id", handlers.DeleteNote)

		// 用户档案相关
		api.GET("/users/:userId/profile", handlers.GetUserProfile)
		api.PUT("/users/:userId/profile", handlers.UpdateUserProfile)

		// 用户模型偏好
		api.GET("/users/:userId/default-model", handlers.GetUserDefaultModel)
		api.PUT("/users/:userId/default-model", handlers.UpdateUserDefaultModel)

		// 职业历史记录
		api.GET("/users/:userId/career-history", handlers.GetCareerHistory)
		api.POST("/users/:userId/career-history", handlers.SaveCareerHistory)

		// 合同风险点
		api.GET("/users/:userId/contract-risks", handlers.GetContractRisks)
		api.POST("/users/:userId/contract-risks", handlers.SaveContractRisk)
		api.PUT("/users/:userId/contract-risks/:riskId", handlers.UpdateContractRisk)

		// 企业监控
		api.GET("/users/:userId/company-monitors", handlers.GetCompanyMonitors)
		api.POST("/users/:userId/company-monitors", handlers.SaveCompanyMonitor)
		api.PUT("/users/:userId/company-monitors/:monitorId", handlers.UpdateCompanyMonitor)

		// 个性化指标
		api.GET("/users/:userId/personal-metrics", handlers.GetPersonalMetrics)
		api.PUT("/users/:userId/personal-metrics", handlers.UpdatePersonalMetrics)

		// 职业阶段
		api.GET("/career-stages", handlers.GetCareerStages)

		// 用户文档管理
		api.GET("/users/:userId/documents", handlers.GetUserDocuments)
		api.POST("/users/:userId/documents", handlers.UploadUserDocument)
		api.GET("/users/:userId/documents/:documentId", handlers.GetUserDocument)
		api.DELETE("/users/:userId/documents/:documentId", handlers.DeleteUserDocument)
		api.POST("/users/:userId/documents/:documentId/process", handlers.ProcessDocument)
		api.GET("/users/:userId/documents/:documentId/extracted-info", handlers.GetDocumentExtractedInfo)
		api.GET("/users/:userId/documents/:documentId/visualization", handlers.GenerateDocumentVisualization)
	}
	return r
}
