package middleware

import (
	"ai-career-buddy/internal/logger"

	"github.com/gin-gonic/gin"
)

// LoggingMiddleware 记录HTTP请求的中间件
func LoggingMiddleware() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		// 记录请求日志
		logger.LogRequest(
			param.Method,
			param.Path,
			param.ClientIP,
			param.StatusCode,
			param.Latency,
		)

		// 返回空字符串，因为我们已经在logger中记录了
		return ""
	})
}

// ErrorRecoveryMiddleware 错误恢复中间件
func ErrorRecoveryMiddleware() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			logger.Error("服务恢复: 路径=%s, 错误=%s", c.Request.URL.Path, err)
		}
		c.AbortWithStatus(500)
	})
}
