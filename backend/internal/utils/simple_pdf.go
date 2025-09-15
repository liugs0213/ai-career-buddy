package utils

import (
	"encoding/base64"
	"fmt"
	"regexp"
	"strings"
)

// SimplePDFExtractor 简单的PDF文本提取器
type SimplePDFExtractor struct{}

// NewSimplePDFExtractor 创建新的简单PDF提取器
func NewSimplePDFExtractor() *SimplePDFExtractor {
	return &SimplePDFExtractor{}
}

// ExtractTextFromBase64PDF 从base64编码的PDF中提取文本
func (e *SimplePDFExtractor) ExtractTextFromBase64PDF(base64Data string) (string, error) {
	// 移除data:application/pdf;base64,前缀
	base64Data = strings.TrimPrefix(base64Data, "data:application/pdf;base64,")

	// 解码base64
	pdfData, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %v", err)
	}

	// 转换为字符串进行文本提取
	pdfContent := string(pdfData)

	// 提取文本
	text := e.extractTextFromPDF(pdfContent)

	// 清理文本
	cleanedText := e.cleanText(text)

	return cleanedText, nil
}

// extractTextFromPDF 从PDF内容中提取文本
func (e *SimplePDFExtractor) extractTextFromPDF(content string) string {
	var extractedText strings.Builder

	// 方法1: 查找括号内的文本 (最常见的PDF文本格式)
	parenthesesRegex := regexp.MustCompile(`\(([^)]+)\)`)
	matches := parenthesesRegex.FindAllStringSubmatch(content, -1)

	for _, match := range matches {
		if len(match) > 1 {
			textStr := match[1]
			// 跳过太短的文本（可能是坐标或格式信息）
			if len(textStr) > 2 && !e.isNumericOrSpecial(textStr) {
				decodedText := e.decodePDFString(textStr)
				if len(decodedText) > 0 {
					extractedText.WriteString(decodedText)
					extractedText.WriteString(" ")
				}
			}
		}
	}

	// 方法2: 查找BT...ET块中的文本
	if extractedText.Len() == 0 {
		btEtRegex := regexp.MustCompile(`BT\s*(.*?)\s*ET`)
		matches := btEtRegex.FindAllStringSubmatch(content, -1)

		for _, match := range matches {
			if len(match) > 1 {
				textBlock := match[1]
				// 提取Tj操作符中的文本
				tjRegex := regexp.MustCompile(`\(([^)]+)\)\s*Tj`)
				tjMatches := tjRegex.FindAllStringSubmatch(textBlock, -1)

				for _, tjMatch := range tjMatches {
					if len(tjMatch) > 1 {
						textStr := tjMatch[1]
						if len(textStr) > 2 {
							decodedText := e.decodePDFString(textStr)
							if len(decodedText) > 0 {
								extractedText.WriteString(decodedText)
								extractedText.WriteString(" ")
							}
						}
					}
				}
			}
		}
	}

	// 方法3: 查找流对象中的文本
	if extractedText.Len() == 0 {
		streamRegex := regexp.MustCompile(`stream\s*(.*?)\s*endstream`)
		matches := streamRegex.FindAllStringSubmatch(content, -1)

		for _, match := range matches {
			if len(match) > 1 {
				streamContent := match[1]
				// 在流中查找文本
				textInStream := e.extractTextFromStream(streamContent)
				if len(textInStream) > 0 {
					extractedText.WriteString(textInStream)
					extractedText.WriteString(" ")
				}
			}
		}
	}

	return extractedText.String()
}

// extractTextFromStream 从PDF流中提取文本
func (e *SimplePDFExtractor) extractTextFromStream(streamContent string) string {
	var text strings.Builder

	// 查找括号内的文本
	parenthesesRegex := regexp.MustCompile(`\(([^)]+)\)`)
	matches := parenthesesRegex.FindAllStringSubmatch(streamContent, -1)

	for _, match := range matches {
		if len(match) > 1 {
			textStr := match[1]
			if len(textStr) > 2 && !e.isNumericOrSpecial(textStr) {
				decodedText := e.decodePDFString(textStr)
				if len(decodedText) > 0 {
					text.WriteString(decodedText)
					text.WriteString(" ")
				}
			}
		}
	}

	return text.String()
}

// decodePDFString 解码PDF字符串
func (e *SimplePDFExtractor) decodePDFString(text string) string {
	// 处理PDF字符串转义
	text = strings.ReplaceAll(text, "\\n", "\n")
	text = strings.ReplaceAll(text, "\\r", "\r")
	text = strings.ReplaceAll(text, "\\t", "\t")
	text = strings.ReplaceAll(text, "\\(", "(")
	text = strings.ReplaceAll(text, "\\)", ")")
	text = strings.ReplaceAll(text, "\\\\", "\\")

	// 处理八进制转义
	octalRegex := regexp.MustCompile(`\\([0-7]{1,3})`)
	text = octalRegex.ReplaceAllStringFunc(text, func(match string) string {
		octalStr := match[1:] // 移除反斜杠
		if len(octalStr) <= 3 {
			var octal int
			fmt.Sscanf(octalStr, "%o", &octal)
			if octal >= 32 && octal <= 126 { // 可打印ASCII字符
				return string(rune(octal))
			}
		}
		return ""
	})

	return text
}

// isNumericOrSpecial 检查是否为数字或特殊字符
func (e *SimplePDFExtractor) isNumericOrSpecial(text string) bool {
	// 检查是否为纯数字
	if regexp.MustCompile(`^[0-9\s\-\.]+$`).MatchString(text) {
		return true
	}

	// 检查是否为坐标或格式信息
	if regexp.MustCompile(`^[0-9\s\-\.]+$`).MatchString(text) ||
		regexp.MustCompile(`^[A-Za-z0-9\s\-\.]+$`).MatchString(text) && len(text) < 5 {
		return true
	}

	return false
}

// cleanText 清理提取的文本
func (e *SimplePDFExtractor) cleanText(text string) string {
	// 移除多余的空白字符
	text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")

	// 移除行首行尾空白
	text = strings.TrimSpace(text)

	// 移除控制字符
	text = regexp.MustCompile(`[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]`).ReplaceAllString(text, "")

	// 移除重复的标点符号
	text = regexp.MustCompile(`([.!?])\s*\\1+`).ReplaceAllString(text, "$1")

	// 限制长度，避免过长的文本
	if len(text) > 15000 {
		text = text[:15000] + "..."
	}

	return text
}

// IsValidPDF 检查是否为有效的PDF
func (e *SimplePDFExtractor) IsValidPDF(base64Data string) bool {
	// 移除前缀
	base64Data = strings.TrimPrefix(base64Data, "data:application/pdf;base64,")

	// 解码base64
	pdfData, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return false
	}

	// 检查PDF文件头
	return len(pdfData) >= 4 && string(pdfData[:4]) == "%PDF"
}
