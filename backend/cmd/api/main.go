package main

import (
	"fmt"
	"log"

	"ai-career-buddy/internal/config"
	"ai-career-buddy/internal/db"
	"ai-career-buddy/internal/logger"
	"ai-career-buddy/internal/models"
	"ai-career-buddy/internal/router"
)

func main() {
	// 加载配置
	config.Load()

	// 初始化日志系统
	if err := logger.Init(config.C.LogDir); err != nil {
		log.Fatalf("初始化日志系统失败: %v", err)
	}
	logger.Info("日志系统初始化成功，日志目录: %s", config.C.LogDir)

	// 连接数据库
	db.Connect(config.C.MySQLDSN)
	logger.Info("数据库连接成功")

	// Auto migrate tables
	if err := db.Conn.AutoMigrate(
		&models.Message{},
		&models.Note{},
		&models.UserProfile{},
		&models.CareerHistory{},
		&models.ContractRisk{},
		&models.CompanyMonitor{},
		&models.PersonalMetrics{},
	); err != nil {
		logger.Fatal("自动迁移失败: %v", err)
	}
	logger.Info("数据库表迁移完成")

	// 设置路由
	r := router.Setup()
	addr := fmt.Sprintf(":%s", config.C.AppPort)

	logger.Info("AI职场管家服务启动，监听端口: %s", config.C.AppPort)
	if err := r.Run(addr); err != nil {
		logger.Fatal("服务启动失败: %v", err)
	}
}
