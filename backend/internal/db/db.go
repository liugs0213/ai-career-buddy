package db

import (
	"strings"

	"ai-career-buddy/internal/logger"

	"gorm.io/driver/mysql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	gormLogger "gorm.io/gorm/logger"
)

var Conn *gorm.DB

func Connect(dsn string) {
	var err error
	var dbType string

	logger.Info("开始连接数据库: DSN=%s", dsn)

	// 配置GORM日志
	gormLogger := gormLogger.Default.LogMode(gormLogger.Info)

	// 根据DSN判断使用哪种数据库
	if strings.HasPrefix(dsn, "file:") {
		// SQLite
		dbType = "SQLite"
		Conn, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{
			Logger: gormLogger,
		})
	} else {
		// MySQL
		dbType = "MySQL"
		Conn, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: gormLogger,
		})

		// 设置MySQL连接字符集，确保中文字符正确存储
		// 针对 MySQL 8.0 优化
		if err == nil {
			// 设置会话字符集
			Conn.Exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci")
			Conn.Exec("SET CHARACTER SET utf8mb4")
			Conn.Exec("SET character_set_client = utf8mb4")
			Conn.Exec("SET character_set_connection = utf8mb4")
			Conn.Exec("SET character_set_results = utf8mb4")
			Conn.Exec("SET collation_connection = utf8mb4_unicode_ci")
			Conn.Exec("SET collation_server = utf8mb4_unicode_ci")

			// 设置SQL模式，兼容MySQL 8.0
			Conn.Exec("SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'")
		}
	}

	if err != nil {
		logger.Fatal("连接数据库失败: 类型=%s, 错误=%v", dbType, err)
	}

	logger.Info("数据库连接成功: 类型=%s", dbType)
}
