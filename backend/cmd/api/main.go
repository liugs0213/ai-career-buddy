package main

import (
	"flag"
	"fmt"
	"log"

	"ai-career-buddy/internal/config"
	"ai-career-buddy/internal/db"
	"ai-career-buddy/internal/logger"
	"ai-career-buddy/internal/models"
	"ai-career-buddy/internal/router"
)

func main() {
	// 解析命令行参数
	var logDir = flag.String("LOG_DIR", "", "日志目录路径")
	flag.Parse()

	// 打印启动信息
	fmt.Println("🚀 AI职场管家后端服务启动中...")

	// 加载配置
	config.Load()

	// 如果通过命令行参数设置了LOG_DIR，则覆盖环境变量
	if *logDir != "" {
		config.C.LogDir = *logDir
		fmt.Printf("📋 通过命令行参数设置日志目录: %s\n", *logDir)
	}

	fmt.Printf("📋 配置加载完成: Port=%s, Env=%s, LogDir=%s\n",
		config.C.AppPort, config.C.Env, config.C.LogDir)

	// 初始化日志系统
	if err := logger.Init(config.C.LogDir); err != nil {
		log.Fatalf("初始化日志系统失败: %v", err)
	}
	logger.Info("日志系统初始化成功，日志目录: %s", config.C.LogDir)
	fmt.Println("✅ 日志系统初始化成功")

	// 连接数据库
	fmt.Println("🔗 连接数据库...")
	db.Connect(config.C.MySQLDSN)
	logger.Info("数据库连接成功")
	fmt.Println("✅ 数据库连接成功")

	// Auto migrate tables
	fmt.Println("📊 执行数据库迁移...")
	if err := db.Conn.AutoMigrate(
		&models.Message{},
		&models.Note{},
		&models.UserProfile{},
		&models.CareerHistory{},
		&models.ContractRisk{},
		&models.CompanyMonitor{},
		&models.PersonalMetrics{},
		&models.UserDocument{},
	); err != nil {
		logger.Fatal("自动迁移失败: %v", err)
	}
	logger.Info("数据库表迁移完成")
	fmt.Println("✅ 数据库表迁移完成")

	// 设置路由
	fmt.Println("🌐 设置路由...")
	r := router.Setup()
	addr := fmt.Sprintf(":%s", config.C.AppPort)

	logger.Info("AI职场管家服务启动，监听端口: %s", config.C.AppPort)
	fmt.Printf("🎉 服务启动成功，监听端口: %s\n", config.C.AppPort)
	fmt.Println("📝 日志将同时输出到控制台和文件")

	if err := r.Run(addr); err != nil {
		logger.Fatal("服务启动失败: %v", err)
	}
}
