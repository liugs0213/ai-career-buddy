package logger

import (
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"
)

// LogLevel 日志级别
type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
	FATAL
)

// Logger 日志记录器
type Logger struct {
	debug *log.Logger
	info  *log.Logger
	warn  *log.Logger
	error *log.Logger
	fatal *log.Logger
}

var (
	// 全局日志实例
	Global *Logger
)

// Init 初始化日志系统
func Init(logDir string) error {
	// 确保日志目录存在
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return fmt.Errorf("创建日志目录失败: %v", err)
	}

	// 创建日志文件
	logFile := filepath.Join(logDir, fmt.Sprintf("app-%s.log", time.Now().Format("2006-01-02")))
	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return fmt.Errorf("打开日志文件失败: %v", err)
	}

	// 创建多输出写入器（同时输出到文件和控制台）
	multiWriter := io.MultiWriter(file, os.Stdout)

	// 创建各级别日志记录器
	Global = &Logger{
		debug: log.New(multiWriter, "[DEBUG] ", log.LstdFlags|log.Lshortfile),
		info:  log.New(multiWriter, "[INFO]  ", log.LstdFlags|log.Lshortfile),
		warn:  log.New(multiWriter, "[WARN]  ", log.LstdFlags|log.Lshortfile),
		error: log.New(multiWriter, "[ERROR] ", log.LstdFlags|log.Lshortfile),
		fatal: log.New(multiWriter, "[FATAL] ", log.LstdFlags|log.Lshortfile),
	}

	return nil
}

// Debug 记录调试信息
func (l *Logger) Debug(format string, v ...interface{}) {
	l.debug.Printf(format, v...)
}

// Info 记录信息
func (l *Logger) Info(format string, v ...interface{}) {
	l.info.Printf(format, v...)
}

// Warn 记录警告
func (l *Logger) Warn(format string, v ...interface{}) {
	l.warn.Printf(format, v...)
}

// Error 记录错误
func (l *Logger) Error(format string, v ...interface{}) {
	l.error.Printf(format, v...)
}

// Fatal 记录致命错误并退出
func (l *Logger) Fatal(format string, v ...interface{}) {
	l.fatal.Printf(format, v...)
	os.Exit(1)
}

// 全局函数，方便使用
func Debug(format string, v ...interface{}) {
	if Global != nil {
		Global.Debug(format, v...)
	}
}

func Info(format string, v ...interface{}) {
	if Global != nil {
		Global.Info(format, v...)
	}
}

func Warn(format string, v ...interface{}) {
	if Global != nil {
		Global.Warn(format, v...)
	}
}

func Error(format string, v ...interface{}) {
	if Global != nil {
		Global.Error(format, v...)
	}
}

func Fatal(format string, v ...interface{}) {
	if Global != nil {
		Global.Fatal(format, v...)
	}
}

// LogRequest 记录HTTP请求
func LogRequest(method, path, clientIP string, statusCode int, duration time.Duration) {
	if Global != nil {
		Global.Info("HTTP请求: %s %s | IP: %s | 状态: %d | 耗时: %v",
			method, path, clientIP, statusCode, duration)
	}
}

// LogAPI 记录API调用
func LogAPI(apiName, modelID string, success bool, duration time.Duration, err error) {
	if Global != nil {
		if success {
			Global.Info("API调用成功: %s | 模型: %s | 耗时: %v", apiName, modelID, duration)
		} else {
			Global.Error("API调用失败: %s | 模型: %s | 耗时: %v | 错误: %v", apiName, modelID, duration, err)
		}
	}
}

// LogDatabase 记录数据库操作
func LogDatabase(operation, table string, success bool, duration time.Duration, err error) {
	if Global != nil {
		if success {
			Global.Debug("数据库操作: %s %s | 耗时: %v", operation, table, duration)
		} else {
			Global.Error("数据库操作失败: %s %s | 耗时: %v | 错误: %v", operation, table, duration, err)
		}
	}
}

// LogBusiness 记录业务逻辑
func LogBusiness(module, action string, data interface{}) {
	if Global != nil {
		Global.Info("业务操作: %s.%s | 数据: %+v", module, action, data)
	}
}
