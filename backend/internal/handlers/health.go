package handlers

import (
	"ai-career-buddy/internal/logger"

	"github.com/gin-gonic/gin"
)

func Health(c *gin.Context) {
	logger.Debug("健康检查请求: IP=%s", c.ClientIP())
	c.JSON(200, gin.H{"status": "ok"})
}
