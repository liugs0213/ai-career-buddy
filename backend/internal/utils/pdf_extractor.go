package utils

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"regexp"
	"strings"
)

// PDFTextExtractor 简单的PDF文本提取器
type PDFTextExtractor struct{}

// NewPDFTextExtractor 创建新的PDF文本提取器
func NewPDFTextExtractor() *PDFTextExtractor {
	return &PDFTextExtractor{}
}

// ExtractTextFromBase64 从base64编码的PDF中提取文本
func (e *PDFTextExtractor) ExtractTextFromBase64(base64Data string) (string, error) {
	// 移除data:application/pdf;base64,前缀
	if strings.HasPrefix(base64Data, "data:application/pdf;base64,") {
		base64Data = strings.TrimPrefix(base64Data, "data:application/pdf;base64,")
	}

	// 解码base64
	pdfData, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %v", err)
	}

	return e.ExtractTextFromBytes(pdfData)
}

// ExtractTextFromBytes 从PDF字节数据中提取文本
func (e *PDFTextExtractor) ExtractTextFromBytes(pdfData []byte) (string, error) {
	reader := bytes.NewReader(pdfData)
	return e.ExtractTextFromReader(reader)
}

// ExtractTextFromReader 从PDF Reader中提取文本
func (e *PDFTextExtractor) ExtractTextFromReader(reader io.Reader) (string, error) {
	// 读取所有数据
	data, err := io.ReadAll(reader)
	if err != nil {
		return "", fmt.Errorf("failed to read PDF data: %v", err)
	}

	// 转换为字符串
	pdfContent := string(data)

	// 提取文本内容
	text := e.extractTextFromPDFContent(pdfContent)

	// 清理和格式化文本
	cleanedText := e.cleanExtractedText(text)

	return cleanedText, nil
}

// extractTextFromPDFContent 从PDF内容中提取文本
func (e *PDFTextExtractor) extractTextFromPDFContent(content string) string {
	var extractedText strings.Builder

	// 查找文本对象 (BT ... ET)
	btEtRegex := regexp.MustCompile(`BT\s*(.*?)\s*ET`)
	matches := btEtRegex.FindAllStringSubmatch(content, -1)

	for _, match := range matches {
		if len(match) > 1 {
			textBlock := match[1]
			// 提取文本字符串
			textStrings := e.extractTextStrings(textBlock)
			for _, textStr := range textStrings {
				extractedText.WriteString(textStr)
				extractedText.WriteString(" ")
			}
		}
	}

	// 如果没有找到BT/ET块，尝试其他方法
	if extractedText.Len() == 0 {
		// 查找括号内的文本
		parenthesesRegex := regexp.MustCompile(`\(([^)]+)\)`)
		matches = parenthesesRegex.FindAllStringSubmatch(content, -1)

		for _, match := range matches {
			if len(match) > 1 {
				textStr := match[1]
				// 解码PDF字符串转义
				decodedText := e.decodePDFString(textStr)
				extractedText.WriteString(decodedText)
				extractedText.WriteString(" ")
			}
		}
	}

	return extractedText.String()
}

// extractTextStrings 从文本块中提取文本字符串
func (e *PDFTextExtractor) extractTextStrings(textBlock string) []string {
	var textStrings []string

	// 查找Tj操作符 (显示文本)
	tjRegex := regexp.MustCompile(`\(([^)]+)\)\s*Tj`)
	matches := tjRegex.FindAllStringSubmatch(textBlock, -1)

	for _, match := range matches {
		if len(match) > 1 {
			textStr := match[1]
			decodedText := e.decodePDFString(textStr)
			textStrings = append(textStrings, decodedText)
		}
	}

	// 查找TJ操作符 (显示文本数组)
	tjArrayRegex := regexp.MustCompile(`\[([^\]]+)\]\s*TJ`)
	matches = tjArrayRegex.FindAllStringSubmatch(textBlock, -1)

	for _, match := range matches {
		if len(match) > 1 {
			arrayContent := match[1]
			// 解析数组中的文本
			textInArray := e.extractTextFromArray(arrayContent)
			textStrings = append(textStrings, textInArray...)
		}
	}

	return textStrings
}

// extractTextFromArray 从PDF文本数组中提取文本
func (e *PDFTextExtractor) extractTextFromArray(arrayContent string) []string {
	var textStrings []string

	// 查找数组中的文本字符串
	textRegex := regexp.MustCompile(`\(([^)]+)\)`)
	matches := textRegex.FindAllStringSubmatch(arrayContent, -1)

	for _, match := range matches {
		if len(match) > 1 {
			textStr := match[1]
			decodedText := e.decodePDFString(textStr)
			textStrings = append(textStrings, decodedText)
		}
	}

	return textStrings
}

// decodePDFString 解码PDF字符串转义
func (e *PDFTextExtractor) decodePDFString(text string) string {
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
			return string(rune(octal))
		}
		return match
	})

	return text
}

// cleanExtractedText 清理提取的文本
func (e *PDFTextExtractor) cleanExtractedText(text string) string {
	// 移除多余的空白字符
	text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")

	// 移除行首行尾空白
	text = strings.TrimSpace(text)

	// 移除控制字符
	text = regexp.MustCompile(`[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]`).ReplaceAllString(text, "")

	// 限制长度，避免过长的文本
	if len(text) > 15000 {
		text = text[:15000] + "..."
	}

	return text
}

// IsPDF 检查是否为PDF文件
func (e *PDFTextExtractor) IsPDF(data []byte) bool {
	// 检查PDF文件头
	return len(data) >= 4 && string(data[:4]) == "%PDF"
}

// GetPDFInfo 获取PDF基本信息
func (e *PDFTextExtractor) GetPDFInfo(data []byte) (map[string]string, error) {
	info := make(map[string]string)

	if !e.IsPDF(data) {
		return info, fmt.Errorf("not a valid PDF file")
	}

	content := string(data)

	// 提取PDF版本
	versionRegex := regexp.MustCompile(`%PDF-(\d+\.\d+)`)
	if matches := versionRegex.FindStringSubmatch(content); len(matches) > 1 {
		info["version"] = matches[1]
	}

	// 提取页数（简单估算）
	pageRegex := regexp.MustCompile(`/Type\s*/Page`)
	matches := pageRegex.FindAllString(content, -1)
	info["pages"] = fmt.Sprintf("%d", len(matches))

	return info, nil
}
