package utils

import (
	"regexp"
	"strings"
	_ "unicode"
	"unicode/utf8"
)

// SanitizeText 清理文本中的不兼容字符
// 主要处理问号字符(�)和其他可能导致数据库错误的字符
func SanitizeText(text string) string {
	if text == "" {
		return text
	}

	// 1. 移除或替换问号字符(�)
	text = strings.ReplaceAll(text, "�", "")

	// 2. 移除其他常见的替换字符
	text = strings.ReplaceAll(text, "�", "")
	text = strings.ReplaceAll(text, "�", "")
	text = strings.ReplaceAll(text, "�", "")

	// 3. 移除控制字符（除了换行符和制表符）
	text = regexp.MustCompile(`[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]`).ReplaceAllString(text, "")

	// 4. 确保文本是有效的UTF-8
	if !utf8.ValidString(text) {
		// 如果包含无效UTF-8字符，进行清理
		text = strings.ToValidUTF8(text, "")
	}

	// 5. 移除过长的空白字符序列
	text = regexp.MustCompile(`\s{3,}`).ReplaceAllString(text, "  ")

	// 6. 移除行首行尾空白
	text = strings.TrimSpace(text)

	return text
}

// SanitizeForDatabase 专门为数据库存储清理文本
func SanitizeForDatabase(text string) string {
	if text == "" {
		return text
	}

	// 先进行基础清理
	text = SanitizeText(text)

	// 移除可能导致MySQL错误的特殊字符
	// 这些字符在某些情况下可能导致编码问题
	problematicChars := []string{
		"\uFFFD", // 替换字符
		"\u0000", // 空字符
		"\u0001", // 开始标题
		"\u0002", // 开始文本
		"\u0003", // 结束文本
		"\u0004", // 结束传输
		"\u0005", // 询问
		"\u0006", // 确认
		"\u0007", // 响铃
		"\u0008", // 退格
		"\u000B", // 垂直制表符
		"\u000C", // 换页符
		"\u000E", // 移出
		"\u000F", // 移入
		"\u0010", // 数据链路转义
		"\u0011", // 设备控制1
		"\u0012", // 设备控制2
		"\u0013", // 设备控制3
		"\u0014", // 设备控制4
		"\u0015", // 否定确认
		"\u0016", // 同步空闲
		"\u0017", // 传输块结束
		"\u0018", // 取消
		"\u0019", // 媒体结束
		"\u001A", // 替换
		"\u001B", // 转义
		"\u001C", // 文件分隔符
		"\u001D", // 组分隔符
		"\u001E", // 记录分隔符
		"\u001F", // 单元分隔符
		"\u007F", // 删除
	}

	for _, char := range problematicChars {
		text = strings.ReplaceAll(text, char, "")
	}

	// 确保文本长度不超过数据库字段限制
	// TEXT字段通常限制为65535字符
	if len(text) > 65000 {
		text = text[:65000] + "...(内容过长已截断)"
	}

	return text
}

// SanitizeFileName 专门为文件名清理，保留中文字符
func SanitizeFileName(fileName string) string {
	if fileName == "" {
		return fileName
	}

	// 移除文件系统不安全的字符
	// 保留中文字符，只移除真正危险的字符
	unsafeChars := []string{
		"/", "\\", ":", "*", "?", "\"", "<", ">", "|",
		"\u0000", "\u0001", "\u0002", "\u0003", "\u0004", "\u0005",
		"\u0006", "\u0007", "\u0008", "\u000B", "\u000C", "\u000E",
		"\u000F", "\u0010", "\u0011", "\u0012", "\u0013", "\u0014",
		"\u0015", "\u0016", "\u0017", "\u0018", "\u0019", "\u001A",
		"\u001B", "\u001C", "\u001D", "\u001E", "\u001F", "\u007F",
	}

	for _, char := range unsafeChars {
		fileName = strings.ReplaceAll(fileName, char, "_")
	}

	// 移除多余的下划线
	fileName = regexp.MustCompile(`_{2,}`).ReplaceAllString(fileName, "_")

	// 移除首尾的下划线和空格
	fileName = strings.Trim(fileName, "_ ")

	// 如果文件名为空，使用默认名称
	if fileName == "" {
		fileName = "document"
	}

	// 确保文件名长度合理
	if len(fileName) > 200 {
		fileName = fileName[:200]
	}

	return fileName
}

// CleanDocumentContent 清理文档内容
func CleanDocumentContent(content string) string {
	if content == "" {
		return content
	}

	// 清理文档内容
	content = SanitizeForDatabase(content)

	// 移除文档中常见的格式问题
	// 1. 移除多余的换行符
	content = regexp.MustCompile(`\n{3,}`).ReplaceAllString(content, "\n\n")

	// 2. 移除多余的制表符
	content = regexp.MustCompile(`\t{2,}`).ReplaceAllString(content, "\t")

	// 3. 移除行尾空白
	lines := strings.Split(content, "\n")
	for i, line := range lines {
		lines[i] = strings.TrimRight(line, " \t")
	}
	content = strings.Join(lines, "\n")

	return content
}

// IsValidUTF8 检查字符串是否为有效的UTF-8
func IsValidUTF8(s string) bool {
	return utf8.ValidString(s)
}

// CountInvalidChars 统计无效字符数量
func CountInvalidChars(s string) int {
	count := 0
	for _, r := range s {
		if r == utf8.RuneError {
			count++
		}
	}
	return count
}

// ReplaceInvalidChars 替换无效字符
func ReplaceInvalidChars(s string, replacement string) string {
	if replacement == "" {
		replacement = ""
	}

	var result strings.Builder
	for _, r := range s {
		if r == utf8.RuneError {
			result.WriteString(replacement)
		} else {
			result.WriteRune(r)
		}
	}
	return result.String()
}
