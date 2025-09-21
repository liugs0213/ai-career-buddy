package api

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"ai-career-buddy/internal/config"
)

// BailianClient 百炼API客户端
type BailianClient struct {
	apiURL string
	apiKey string
	client *http.Client
}

// NewBailianClient 创建新的百炼客户端
func NewBailianClient() *BailianClient {
	return &BailianClient{
		apiURL: config.C.BailianAPIURL,
		apiKey: config.C.BailianAPIKey,
		client: &http.Client{
			Timeout: 30 * time.Second, // 减少超时时间，提高响应速度
		},
	}
}

// ChatMessage 聊天消息结构
type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatRequest 聊天请求结构
type ChatRequest struct {
	Model    string        `json:"model"`
	Stream   bool          `json:"stream"`
	Messages []ChatMessage `json:"messages"`
}

// ChatResponse 聊天响应结构
type ChatResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

// StreamChunk 流式响应块
type StreamChunk struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index int `json:"index"`
		Delta struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"delta"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
}

// SendMessage 发送消息到百炼API
func (c *BailianClient) SendMessage(modelID, userMessage string, attachments []string) (*ChatResponse, error) {
	// 构建消息内容
	content := userMessage
	if len(attachments) > 0 {
		content += "\n\n[附件信息]:\n"
		for i, attachment := range attachments {
			if strings.HasPrefix(attachment, "data:image/") {
				content += fmt.Sprintf("图片附件 %d: [已上传]\n", i+1)
			} else if strings.HasPrefix(attachment, "data:application/pdf") {
				content += fmt.Sprintf("PDF附件 %d: [已上传]\n", i+1)
			}
		}
	}

	// 构建请求
	request := ChatRequest{
		Model:  modelID,
		Stream: false,
		Messages: []ChatMessage{
			{
				Role:    "user",
				Content: content,
			},
		},
	}

	// 序列化请求
	requestBody, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("序列化请求失败: %v", err)
	}

	// 创建HTTP请求
	req, err := http.NewRequest("POST", c.apiURL, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %v", err)
	}

	// 设置请求头
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("x-higress-llm-model", modelID)

	// 发送请求
	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("发送请求失败: %v", err)
	}
	defer resp.Body.Close()

	// 检查响应状态
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API请求失败 (状态码: %d): %s", resp.StatusCode, string(body))
	}

	// 解析响应
	var response ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("解析响应失败: %v", err)
	}

	return &response, nil
}

// SendStreamMessage 发送流式消息到百炼API
func (c *BailianClient) SendStreamMessage(modelID, userMessage string, attachments []string, writer io.Writer) error {
	// 构建消息内容
	content := userMessage
	if len(attachments) > 0 {
		content += "\n\n[附件信息]:\n"
		for i, attachment := range attachments {
			if strings.HasPrefix(attachment, "data:image/") {
				content += fmt.Sprintf("图片附件 %d: [已上传]\n", i+1)
			} else if strings.HasPrefix(attachment, "data:application/pdf") {
				content += fmt.Sprintf("PDF附件 %d: [已上传]\n", i+1)
			}
		}
	}

	// 构建请求
	request := ChatRequest{
		Model:  modelID,
		Stream: true,
		Messages: []ChatMessage{
			{
				Role:    "user",
				Content: content,
			},
		},
	}

	// 序列化请求
	requestBody, err := json.Marshal(request)
	if err != nil {
		return fmt.Errorf("序列化请求失败: %v", err)
	}

	// 创建HTTP请求
	req, err := http.NewRequest("POST", c.apiURL, bytes.NewBuffer(requestBody))
	if err != nil {
		return fmt.Errorf("创建请求失败: %v", err)
	}

	// 设置请求头
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("x-higress-llm-model", modelID)

	// 发送请求
	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("发送请求失败: %v", err)
	}
	defer resp.Body.Close()

	// 检查响应状态
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API请求失败 (状态码: %d): %s", resp.StatusCode, string(body))
	}

	// 处理SSE流式响应
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()

		// 跳过空行和非data行
		if line == "" || !strings.HasPrefix(line, "data: ") {
			continue
		}

		// 提取JSON数据
		jsonData := strings.TrimPrefix(line, "data: ")

		// 跳过结束标记
		if jsonData == "[DONE]" {
			break
		}

		// 解析JSON
		var chunk StreamChunk
		if err := json.Unmarshal([]byte(jsonData), &chunk); err != nil {
			continue // 跳过解析错误的数据块
		}

		// 提取内容并写入
		if len(chunk.Choices) > 0 && chunk.Choices[0].Delta.Content != "" {
			if _, err := writer.Write([]byte(chunk.Choices[0].Delta.Content)); err != nil {
				return fmt.Errorf("写入流式内容失败: %v", err)
			}
			// 立即刷新输出
			if flusher, ok := writer.(http.Flusher); ok {
				flusher.Flush()
			}
		}

		// 检查是否结束
		if len(chunk.Choices) > 0 && chunk.Choices[0].FinishReason != "" {
			break
		}
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("读取流式响应失败: %v", err)
	}

	return nil
}

// GetModelList 获取可用模型列表
func (c *BailianClient) GetModelList() ([]string, error) {
	// 返回支持的模型列表，包括Azure OpenAI模型
	return []string{
		// Azure OpenAI 模型
		"azure/gpt-5-mini",
		"azure/gpt-5",
		"azure/gpt-5-chat",
		"azure/gpt-5-nano",
		// 百炼模型
		"nbg-v3-33b",
		"bailian/deepseek-v3",
		"bailian/deepseek-r1",
		"bailian/deepseek-v3.1",
		"bailian/qwen-flash",
		"bailian/qwen-plus",
		"bailian/qwen-vl-max",
		"bailian/qwen-vl-plus",
	}, nil
}
