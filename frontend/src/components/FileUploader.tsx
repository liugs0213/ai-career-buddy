import React, { useState, useCallback } from 'react';
import { Upload, Button, Progress, Alert, Tag, Typography, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, FileTextOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { api } from '../api';
import { ApiError, ApiErrorType } from '../utils/apiResponse';

const { Text } = Typography;

export interface FileUploadResult {
  success: boolean;
  documentId?: string;
  attachmentId?: string;
  error?: string;
}

interface FileUploaderProps {
  userId: string;
  onUploadComplete: (result: FileUploadResult, file: File) => void;
  onUploadError?: (error: string, file: File) => void;
  maxSize?: number; // MB
  accept?: string[];
  disabled?: boolean;
}

// 文件类型配置
const FILE_TYPE_CONFIG = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    icon: <FileImageOutlined />,
    color: 'blue'
  },
  pdf: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    icon: <FilePdfOutlined />,
    color: 'red'
  },
  document: {
    extensions: ['.md', '.txt', '.doc', '.docx'],
    mimeTypes: ['text/markdown', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    icon: <FileTextOutlined />,
    color: 'green'
  }
};

const FileUploader: React.FC<FileUploaderProps> = ({
  userId,
  onUploadComplete,
  onUploadError,
  maxSize = 10,
  accept = ['image', 'pdf', 'document'],
  disabled = false
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  // 获取文件类型
  const getFileType = (file: File): string | null => {
    const fileName = file.name.toLowerCase();
    const mimeType = file.type;

    for (const [type, config] of Object.entries(FILE_TYPE_CONFIG)) {
      if (accept.includes(type)) {
        if (config.extensions.some(ext => fileName.endsWith(ext)) || 
            config.mimeTypes.includes(mimeType)) {
          return type;
        }
      }
    }
    return null;
  };

  // 智能推断文档类型
  const inferDocumentType = (fileName: string): string => {
    const name = fileName.toLowerCase();
    
    if (name.includes('简历') || name.includes('resume') || name.includes('cv')) {
      return 'resume';
    }
    if (name.includes('合同') || name.includes('contract')) {
      return 'contract';
    }
    if (name.includes('offer') || name.includes('录用')) {
      return 'offer';
    }
    if (name.includes('在职') || name.includes('employment') || name.includes('证明')) {
      return 'employment';
    }
    
    return 'other';
  };

  // 文件验证
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `文件大小不能超过 ${maxSize}MB` };
    }

    // 检查文件类型
    const fileType = getFileType(file);
    if (!fileType) {
      const allowedTypes = accept.map(type => FILE_TYPE_CONFIG[type as keyof typeof FILE_TYPE_CONFIG]?.extensions.join(', ')).join(', ');
      return { valid: false, error: `不支持的文件类型，请选择: ${allowedTypes}` };
    }

    return { valid: true };
  };

  // 上传前检查
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const validation = validateFile(file);
    
    if (!validation.valid) {
      setError(validation.error);
      onUploadError?.(validation.error!, file);
      return false;
    }

    setError(undefined);
    return true;
  };

  // 处理文件上传
  const handleUpload = useCallback(async (file: File): Promise<FileUploadResult> => {
    try {
      const fileType = getFileType(file);
      
      if (fileType === 'document') {
        // 文档类型上传到文档API
        const documentType = inferDocumentType(file.name);
        const result = await api.uploadDocument(userId, file, documentType);
        
        return {
          success: true,
          documentId: result.data?.documentId || result.documentId,
        };
      } else {
        // 其他类型作为附件处理
        const formData = new FormData();
        formData.append('file', file);
        
        // 这里需要实现附件上传API
        // const result = await api.uploadAttachment(formData);
        
        return {
          success: true,
          attachmentId: `attachment_${Date.now()}`, // 临时ID
        };
      }
    } catch (error) {
      let errorMessage = '上传失败';
      
      if (error instanceof ApiError) {
        switch (error.type) {
          case ApiErrorType.NETWORK_ERROR:
            errorMessage = '网络连接失败，请检查网络状态';
            break;
          case ApiErrorType.TIMEOUT_ERROR:
            errorMessage = '上传超时，请重试';
            break;
          case ApiErrorType.VALIDATION_ERROR:
            errorMessage = error.message;
            break;
          default:
            errorMessage = error.message || '上传失败';
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [userId]);

  // 自定义上传逻辑
  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onProgress, onSuccess, onError } = options;
    
    if (!(file instanceof File)) {
      onError?.(new Error('无效的文件对象'));
      return;
    }

    setUploading(true);
    
    try {
      // 模拟上传进度
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) {
          progress = 90;
          clearInterval(progressInterval);
        }
        onProgress?.({ percent: progress });
      }, 200);

      const result = await handleUpload(file);
      
      clearInterval(progressInterval);
      onProgress?.({ percent: 100 });
      
      if (result.success) {
        onSuccess?.(result, file);
        onUploadComplete(result, file);
      } else {
        const error = new Error(result.error || '上传失败');
        onError?.(error);
        onUploadError?.(result.error || '上传失败', file);
        setError(result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      onError?.(error as Error);
      onUploadError?.(errorMessage, file);
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // 文件变化处理
  const handleChange: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList);
    
    if (info.file.status === 'done') {
      setError(undefined);
    } else if (info.file.status === 'error') {
      setError(`${info.file.name} 上传失败`);
    }
  };

  // 移除文件
  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    return true;
  };

  // 获取文件类型标签
  const getFileTypeTag = (fileName: string) => {
    const name = fileName.toLowerCase();
    
    for (const [type, config] of Object.entries(FILE_TYPE_CONFIG)) {
      if (config.extensions.some(ext => name.endsWith(ext))) {
        return (
          <Tag color={config.color} icon={config.icon} size="small">
            {type.toUpperCase()}
          </Tag>
        );
      }
    }
    
    return <Tag size="small">未知</Tag>;
  };

  return (
    <div>
      <Upload
        fileList={fileList}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        onChange={handleChange}
        onRemove={handleRemove}
        multiple={false}
        disabled={disabled || uploading}
        showUploadList={{
          showPreviewIcon: false,
          showRemoveIcon: true,
          showDownloadIcon: false,
          removeIcon: <DeleteOutlined />,
        }}
      >
        <Button 
          icon={<UploadOutlined />} 
          disabled={disabled || uploading}
          loading={uploading}
        >
          {uploading ? '上传中...' : '选择文件'}
        </Button>
      </Upload>

      {error && (
        <Alert
          message="上传错误"
          description={error}
          type="error"
          closable
          onClose={() => setError(undefined)}
          style={{ marginTop: 8 }}
        />
      )}

      {fileList.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">已选择文件：</Text>
          <div style={{ marginTop: 8 }}>
            {fileList.map(file => (
              <div key={file.uid} style={{ marginBottom: 8 }}>
                <Space>
                  {getFileTypeTag(file.name)}
                  <Text>{file.name}</Text>
                  <Text type="secondary">
                    ({Math.round((file.size || 0) / 1024)} KB)
                  </Text>
                </Space>
                {file.status === 'uploading' && (
                  <Progress 
                    percent={file.percent} 
                    size="small" 
                    style={{ marginTop: 4 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          支持的文件类型: {accept.map(type => 
            FILE_TYPE_CONFIG[type as keyof typeof FILE_TYPE_CONFIG]?.extensions.join(', ')
          ).join(', ')} | 最大 {maxSize}MB
        </Text>
      </div>
    </div>
  );
};

export default FileUploader;

