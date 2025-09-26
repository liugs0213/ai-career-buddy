package handlers

import (
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"ai-career-buddy/internal/db"
	"ai-career-buddy/internal/logger"
	"ai-career-buddy/internal/models"
	"ai-career-buddy/internal/utils"

	"github.com/gin-gonic/gin"
)

// GetUserDocuments 获取用户文档列表
func GetUserDocuments(c *gin.Context) {
	userID := c.Param("userId")
	documentType := c.Query("documentType") // resume, contract, offer, employment, other
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	if limit > 100 {
		limit = 100
	}

	var documents []models.UserDocument
	query := db.Conn.Where("user_id = ?", userID)

	if documentType != "" {
		query = query.Where("document_type = ?", documentType)
	}

	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&documents).Error; err != nil {
		logger.Error("获取用户文档列表失败: UserID=%s, 错误=%v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取失败"})
		return
	}

	logger.Info("获取用户文档列表: UserID=%s, DocumentType=%s, 数量=%d", userID, documentType, len(documents))
	c.JSON(http.StatusOK, gin.H{"documents": documents})
}

// UploadUserDocument 上传用户文档
func UploadUserDocument(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户ID不能为空"})
		return
	}

	// 获取表单数据
	documentType := c.PostForm("documentType")
	if documentType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文档类型不能为空"})
		return
	}

	// 验证文档类型
	validTypes := []string{"resume", "contract", "offer", "employment", "other"}
	if !contains(validTypes, documentType) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的文档类型"})
		return
	}

	// 获取上传的文件
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		logger.Error("获取上传文件失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "获取文件失败"})
		return
	}
	defer file.Close()

	// 验证文件类型
	fileExt := strings.ToLower(filepath.Ext(header.Filename))
	validExts := []string{".md"}
	if !contains(validExts, fileExt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不支持的文件类型，仅支持 Markdown(.md) 格式"})
		return
	}

	// 验证文件大小 (10MB限制)
	if header.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文件大小不能超过10MB"})
		return
	}

	// 创建存储目录
	uploadDir := fmt.Sprintf("uploads/%s", userID)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		logger.Error("创建上传目录失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建目录失败"})
		return
	}

	// 生成唯一文件名
	timestamp := time.Now().Unix()
	fileName := fmt.Sprintf("%d_%s", timestamp, header.Filename)
	filePath := filepath.Join(uploadDir, fileName)

	// 保存文件
	dst, err := os.Create(filePath)
	if err != nil {
		logger.Error("创建文件失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存文件失败"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		logger.Error("保存文件失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存文件失败"})
		return
	}

	// 提取文件内容（仅支持Markdown格式）
	var fileContent string
	if fileExt == ".md" {
		content, err := os.ReadFile(filePath)
		if err == nil {
			fileContent = string(content)
		}
	}

	// 清理文档内容，移除不兼容字符
	cleanedFileName := utils.SanitizeFileName(header.Filename)
	cleanedFileContent := utils.CleanDocumentContent(fileContent)

	// 创建文档记录
	document := models.UserDocument{
		UserID:           userID,
		DocumentType:     documentType,
		FileName:         cleanedFileName,
		FileSize:         header.Size,
		FileType:         strings.TrimPrefix(fileExt, "."),
		FilePath:         filePath,
		FileContent:      cleanedFileContent,
		UploadSource:     "manual",
		IsProcessed:      false,
		ProcessingStatus: "pending",
	}

	if err := db.Conn.Create(&document).Error; err != nil {
		logger.Error("创建文档记录失败: UserID=%s, 错误=%v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建记录失败"})
		return
	}

	logger.Info("用户文档上传成功: UserID=%s, DocumentType=%s, FileName=%s", userID, documentType, header.Filename)

	// 如果有文件内容，自动触发分析（仅支持Markdown文件）
	if fileContent != "" && fileExt == ".md" {
		go func() {
			// 延迟1秒后开始分析，确保文档记录已保存
			time.Sleep(1 * time.Second)
			err := processDocumentWithAI(&document)
			if err != nil {
				logger.Error("文档自动分析失败: DocumentID=%d, FileType=%s, 错误=%v", document.ID, fileExt, err)
				document.ProcessingStatus = "failed"
				document.ProcessingError = err.Error()
			} else {
				document.ProcessingStatus = "completed"
				document.IsProcessed = true
			}
			document.UpdatedAt = time.Now()
			db.Conn.Save(&document)
		}()
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "文档上传成功",
		"document":    document,
		"autoAnalyze": fileExt == ".md" && fileContent != "",
	})
}

// GetUserDocument 获取单个用户文档
func GetUserDocument(c *gin.Context) {
	documentID := c.Param("documentId")
	if documentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文档ID不能为空"})
		return
	}

	var document models.UserDocument
	if err := db.Conn.Where("id = ?", documentID).First(&document).Error; err != nil {
		logger.Error("获取文档失败: DocumentID=%s, 错误=%v", documentID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "文档不存在"})
		return
	}

	logger.Info("获取文档: DocumentID=%s", documentID)
	c.JSON(http.StatusOK, document)
}

// DeleteUserDocument 删除用户文档
func DeleteUserDocument(c *gin.Context) {
	documentID := c.Param("documentId")
	if documentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文档ID不能为空"})
		return
	}

	var document models.UserDocument
	if err := db.Conn.Where("id = ?", documentID).First(&document).Error; err != nil {
		logger.Error("获取文档失败: DocumentID=%s, 错误=%v", documentID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "文档不存在"})
		return
	}

	// 删除文件
	if document.FilePath != "" {
		if err := os.Remove(document.FilePath); err != nil {
			logger.Warn("删除文件失败: %v", err)
		}
	}

	// 删除数据库记录
	if err := db.Conn.Delete(&document).Error; err != nil {
		logger.Error("删除文档记录失败: DocumentID=%s, 错误=%v", documentID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	logger.Info("文档删除成功: DocumentID=%s", documentID)
	c.JSON(http.StatusOK, gin.H{"message": "文档删除成功"})
}

// ProcessDocument 处理文档（AI信息提取）
func ProcessDocument(c *gin.Context) {
	documentID := c.Param("documentId")
	if documentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文档ID不能为空"})
		return
	}

	var document models.UserDocument
	if err := db.Conn.Where("id = ?", documentID).First(&document).Error; err != nil {
		logger.Error("获取文档失败: DocumentID=%s, 错误=%v", documentID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "文档不存在"})
		return
	}

	// 更新处理状态
	document.ProcessingStatus = "processing"
	document.UpdatedAt = time.Now()
	db.Conn.Save(&document)

	// 异步处理文档
	go func() {
		err := processDocumentWithAI(&document)
		if err != nil {
			logger.Error("文档AI处理失败: DocumentID=%s, 错误=%v", documentID, err)
			document.ProcessingStatus = "failed"
			document.ProcessingError = err.Error()
		} else {
			document.ProcessingStatus = "completed"
			document.IsProcessed = true
		}
		document.UpdatedAt = time.Now()
		db.Conn.Save(&document)
	}()

	logger.Info("开始处理文档: DocumentID=%s", documentID)
	c.JSON(http.StatusOK, gin.H{"message": "文档处理已开始"})
}

// GetDocumentExtractedInfo 获取文档提取信息
func GetDocumentExtractedInfo(c *gin.Context) {
	documentID := c.Param("documentId")
	if documentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文档ID不能为空"})
		return
	}

	var document models.UserDocument
	if err := db.Conn.Where("id = ?", documentID).First(&document).Error; err != nil {
		logger.Error("获取文档失败: DocumentID=%s, 错误=%v", documentID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "文档不存在"})
		return
	}

	if !document.IsProcessed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文档尚未处理"})
		return
	}

	extractedInfo, err := document.GetExtractedInfo()
	if err != nil {
		logger.Error("解析提取信息失败: DocumentID=%s, 错误=%v", documentID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "解析信息失败"})
		return
	}

	// 生成可视化数据
	extractor := utils.NewDocumentExtractor()
	visualizationData, err := extractor.GenerateVisualizationData(extractedInfo, document.DocumentType)
	if err != nil {
		logger.Warn("生成可视化数据失败: DocumentID=%s, 错误=%v", documentID, err)
		visualizationData = map[string]interface{}{}
	}

	logger.Info("获取文档提取信息: DocumentID=%s", documentID)
	c.JSON(http.StatusOK, gin.H{
		"document":          document,
		"extractedInfo":     extractedInfo,
		"visualizationData": visualizationData,
	})
}

// RetryDocumentProcessing 重新处理文档
func RetryDocumentProcessing(c *gin.Context) {
	documentID := c.Param("documentId")
	if documentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文档ID不能为空"})
		return
	}

	var document models.UserDocument
	if err := db.Conn.Where("id = ?", documentID).First(&document).Error; err != nil {
		logger.Error("获取文档失败: DocumentID=%s, 错误=%v", documentID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "文档不存在"})
		return
	}

	// 重置处理状态
	document.ProcessingStatus = "processing"
	document.ProcessingError = ""
	document.IsProcessed = false
	document.UpdatedAt = time.Now()
	db.Conn.Save(&document)

	// 异步处理文档
	go func() {
		time.Sleep(1 * time.Second)
		err := processDocumentWithAI(&document)
		if err != nil {
			logger.Error("文档重新处理失败: DocumentID=%s, 错误=%v", documentID, err)
			document.ProcessingStatus = "failed"
			document.ProcessingError = err.Error()
		} else {
			document.ProcessingStatus = "completed"
			document.IsProcessed = true
		}
		document.UpdatedAt = time.Now()
		db.Conn.Save(&document)
	}()

	logger.Info("开始重新处理文档: DocumentID=%s", documentID)
	c.JSON(http.StatusOK, gin.H{
		"message":  "文档重新处理已开始",
		"document": document,
	})
}

// GenerateDocumentVisualization 生成文档可视化数据
func GenerateDocumentVisualization(c *gin.Context) {
	documentID := c.Param("documentId")
	if documentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文档ID不能为空"})
		return
	}

	var document models.UserDocument
	if err := db.Conn.Where("id = ?", documentID).First(&document).Error; err != nil {
		logger.Error("获取文档失败: DocumentID=%s, 错误=%v", documentID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "文档不存在"})
		return
	}

	if !document.IsProcessed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文档尚未处理"})
		return
	}

	extractedInfo, err := document.GetExtractedInfo()
	if err != nil {
		logger.Error("解析提取信息失败: DocumentID=%s, 错误=%v", documentID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "解析信息失败"})
		return
	}

	// 生成可视化数据
	extractor := utils.NewDocumentExtractor()
	visualizationData, err := extractor.GenerateVisualizationData(extractedInfo, document.DocumentType)
	if err != nil {
		logger.Error("生成可视化数据失败: DocumentID=%s, 错误=%v", documentID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "生成可视化数据失败"})
		return
	}

	logger.Info("生成文档可视化数据: DocumentID=%s", documentID)
	c.JSON(http.StatusOK, gin.H{
		"visualizationData": visualizationData,
		"documentType":      document.DocumentType,
	})
}

// processDocumentWithAI 使用AI处理文档
func processDocumentWithAI(document *models.UserDocument) error {
	// 使用文档提取器提取信息
	extractor := utils.NewDocumentExtractor()
	extractedInfo, err := extractor.ExtractDocumentInfo(document)
	if err != nil {
		logger.Error("AI文档信息提取失败: DocumentID=%d, 错误=%v", document.ID, err)
		return err
	}

	// 保存提取的信息
	if err := document.SetExtractedInfo(extractedInfo); err != nil {
		logger.Error("保存提取信息失败: DocumentID=%d, 错误=%v", document.ID, err)
		return err
	}

	logger.Info("文档AI处理完成: DocumentID=%d, DocumentType=%s", document.ID, document.DocumentType)
	return nil
}

// extractPDFText 提取PDF文本内容
func extractPDFText(filePath string) (string, error) {
	// 读取PDF文件
	pdfData, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("读取PDF文件失败: %v", err)
	}

	// 将PDF数据转换为base64格式
	base64Data := "data:application/pdf;base64," + base64.StdEncoding.EncodeToString(pdfData)

	// 使用PDF提取器提取文本
	pdfExtractor := utils.NewSimplePDFExtractor()
	text, err := pdfExtractor.ExtractTextFromBase64PDF(base64Data)
	if err != nil {
		return "", fmt.Errorf("PDF文本提取失败: %v", err)
	}

	// 清理文本内容
	cleanedText := utils.CleanDocumentContent(text)

	// 如果提取的文本太短，可能提取失败
	if len(cleanedText) < 10 {
		return "", fmt.Errorf("PDF文本提取结果过短，可能提取失败")
	}

	return cleanedText, nil
}

// contains 检查切片是否包含指定元素
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
