package utils

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// ApiResponse 统一API响应格式
type ApiResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Message   string      `json:"message,omitempty"`
	Error     string      `json:"error,omitempty"`
	Code      string      `json:"code,omitempty"`
	Timestamp string      `json:"timestamp"`
}

// SuccessResponse 返回成功响应
func SuccessResponse(c *gin.Context, data interface{}, message string) {
	c.JSON(http.StatusOK, ApiResponse{
		Success:   true,
		Data:      data,
		Message:   message,
		Timestamp: time.Now().Format(time.RFC3339),
	})
}

// ErrorResponse 返回错误响应
func ErrorResponse(c *gin.Context, statusCode int, error string, code string) {
	c.JSON(statusCode, ApiResponse{
		Success:   false,
		Error:     error,
		Code:      code,
		Timestamp: time.Now().Format(time.RFC3339),
	})
}

// BadRequestResponse 返回400错误
func BadRequestResponse(c *gin.Context, error string) {
	ErrorResponse(c, http.StatusBadRequest, error, "BAD_REQUEST")
}

// NotFoundResponse 返回404错误
func NotFoundResponse(c *gin.Context, error string) {
	ErrorResponse(c, http.StatusNotFound, error, "NOT_FOUND")
}

// InternalServerErrorResponse 返回500错误
func InternalServerErrorResponse(c *gin.Context, error string) {
	ErrorResponse(c, http.StatusInternalServerError, error, "INTERNAL_SERVER_ERROR")
}
