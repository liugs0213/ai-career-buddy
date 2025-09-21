package utils

import (
	"strings"
	"unicode"
)

// SanitizeHeaderValue 清理 HTTP 请求头值，移除无效字符
func SanitizeHeaderValue(value string) string {
	if value == "" {
		return value
	}

	// 移除控制字符 (ASCII 0-31)
	var result strings.Builder
	for _, r := range value {
		// 保留可打印字符和空格
		if r >= 32 && r <= 126 {
			result.WriteRune(r)
		} else if r == '\t' {
			// 保留制表符
			result.WriteRune(r)
		}
		// 其他控制字符被忽略
	}

	// 移除首尾空白
	cleaned := strings.TrimSpace(result.String())

	// 如果清理后为空，返回默认值
	if cleaned == "" {
		return "default"
	}

	return cleaned
}

// ValidateHeaderValue 验证 HTTP 请求头值是否有效
func ValidateHeaderValue(value string) bool {
	if value == "" {
		return false
	}

	// 检查是否包含无效字符
	for _, r := range value {
		// 不允许换行符和回车符
		if r == '\n' || r == '\r' {
			return false
		}
		// 不允许控制字符（除了制表符）
		if r < 32 && r != '\t' {
			return false
		}
		// 不允许非 ASCII 字符
		if r > 126 {
			return false
		}
	}

	return true
}

// SanitizeModelID 专门用于清理模型ID
func SanitizeModelID(modelID string) string {
	if modelID == "" {
		return "default"
	}

	// 移除常见的无效字符
	cleaned := strings.ReplaceAll(modelID, "\n", "")
	cleaned = strings.ReplaceAll(cleaned, "\r", "")
	cleaned = strings.ReplaceAll(cleaned, ":", "-")
	cleaned = strings.ReplaceAll(cleaned, ";", "-")
	cleaned = strings.ReplaceAll(cleaned, ",", "-")
	cleaned = strings.ReplaceAll(cleaned, " ", "-")

	// 移除首尾空白
	cleaned = strings.TrimSpace(cleaned)

	// 如果清理后为空，返回默认值
	if cleaned == "" {
		return "default"
	}

	// 确保只包含字母、数字、连字符和下划线
	var result strings.Builder
	for _, r := range cleaned {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '-' || r == '_' || r == '/' {
			result.WriteRune(r)
		} else {
			result.WriteRune('-')
		}
	}

	final := result.String()
	if final == "" {
		return "default"
	}

	return final
}
