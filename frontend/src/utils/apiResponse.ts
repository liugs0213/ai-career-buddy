// 统一的API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  timestamp?: string;
}

// 分页响应格式
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 错误类型
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 自定义错误类
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly response?: any;

  constructor(
    message: string,
    type: ApiErrorType = ApiErrorType.UNKNOWN_ERROR,
    statusCode?: number,
    code?: string,
    response?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.code = code;
    this.response = response;
  }
}

// API响应处理工具
export class ApiResponseHandler {
  // 处理成功响应
  static handleSuccess<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  // 处理错误响应
  static handleError(
    error: any,
    defaultMessage: string = '请求失败'
  ): ApiResponse {
    let apiError: ApiError;

    if (error instanceof ApiError) {
      apiError = error;
    } else if (error.response) {
      // HTTP错误响应
      const { status, data } = error.response;
      const message = data?.message || data?.error || defaultMessage;
      
      let errorType: ApiErrorType;
      switch (status) {
        case 400:
          errorType = ApiErrorType.VALIDATION_ERROR;
          break;
        case 401:
          errorType = ApiErrorType.AUTHENTICATION_ERROR;
          break;
        case 403:
          errorType = ApiErrorType.AUTHORIZATION_ERROR;
          break;
        case 404:
          errorType = ApiErrorType.NOT_FOUND_ERROR;
          break;
        case 500:
        case 502:
        case 503:
          errorType = ApiErrorType.SERVER_ERROR;
          break;
        default:
          errorType = ApiErrorType.UNKNOWN_ERROR;
      }

      apiError = new ApiError(message, errorType, status, data?.code, data);
    } else if (error.code === 'ECONNABORTED') {
      // 超时错误
      apiError = new ApiError('请求超时，请稍后重试', ApiErrorType.TIMEOUT_ERROR);
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      // 网络错误
      apiError = new ApiError('网络连接失败，请检查网络状态', ApiErrorType.NETWORK_ERROR);
    } else {
      // 其他错误
      const message = error.message || defaultMessage;
      apiError = new ApiError(message, ApiErrorType.UNKNOWN_ERROR);
    }

    return {
      success: false,
      error: apiError.message,
      code: apiError.code,
      timestamp: new Date().toISOString()
    };
  }

  // 检查响应是否成功
  static isSuccess(response: ApiResponse): boolean {
    return response.success === true;
  }

  // 获取错误信息
  static getErrorMessage(response: ApiResponse): string {
    return response.error || response.message || '未知错误';
  }

  // 处理分页响应
  static handlePaginatedResponse<T>(
    data: T[],
    page: number,
    pageSize: number,
    total: number,
    message?: string
  ): PaginatedResponse<T> {
    return {
      success: true,
      data,
      message,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      },
      timestamp: new Date().toISOString()
    };
  }
}

// 响应转换工具
export class ResponseTransformer {
  // 转换旧格式响应为新格式
  static transformLegacyResponse(response: any): ApiResponse {
    // 如果已经是新格式，直接返回
    if (typeof response === 'object' && 'success' in response) {
      return response;
    }

    // 如果是数组，包装为成功响应
    if (Array.isArray(response)) {
      return ApiResponseHandler.handleSuccess(response);
    }

    // 如果是对象且包含错误信息
    if (response && response.error) {
      return {
        success: false,
        error: response.error,
        timestamp: new Date().toISOString()
      };
    }

    // 默认作为成功响应处理
    return ApiResponseHandler.handleSuccess(response);
  }

  // 转换消息列表响应
  static transformMessageResponse(messages: any[]): ApiResponse<any[]> {
    if (!Array.isArray(messages)) {
      return ApiResponseHandler.handleError(
        new Error('Invalid message format'),
        '消息格式错误'
      );
    }

    return ApiResponseHandler.handleSuccess(messages, '消息获取成功');
  }

  // 转换历史记录响应
  static transformHistoryResponse(response: any): ApiResponse<any> {
    if (response && response.histories) {
      return ApiResponseHandler.handleSuccess(response, '历史记录获取成功');
    }

    return ApiResponseHandler.handleSuccess(
      { histories: response || [] },
      '历史记录获取成功'
    );
  }
}

// 请求重试工具
export class RetryHandler {
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    backoff: number = 2
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // 如果是最后一次尝试，直接抛出错误
        if (attempt === maxRetries) {
          break;
        }

        // 对于某些错误类型，不进行重试
        if (error instanceof ApiError) {
          if (error.type === ApiErrorType.AUTHENTICATION_ERROR ||
              error.type === ApiErrorType.AUTHORIZATION_ERROR ||
              error.type === ApiErrorType.VALIDATION_ERROR) {
            break;
          }
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt - 1)));
      }
    }

    throw lastError;
  }
}

