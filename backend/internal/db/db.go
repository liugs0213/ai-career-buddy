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
	}

	if err != nil {
		logger.Fatal("连接数据库失败: 类型=%s, 错误=%v", dbType, err)
	}

	logger.Info("数据库连接成功: 类型=%s", dbType)
}
