// 后台任务队列系统
interface Task {
  id: string;
  type: 'stream_message' | 'file_upload' | 'pdf_extract';
  payload: any;
  onProgress?: (progress: number) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

class TaskQueue {
  private queue: Task[] = [];
  private running: Set<string> = new Set();
  private maxConcurrent: number = 3;

  addTask(task: Task): void {
    this.queue.push(task);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.running.size >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.running.add(task.id);

    try {
      let result: any;
      
      switch (task.type) {
        case 'stream_message':
          result = await this.handleStreamMessage(task);
          break;
        case 'file_upload':
          result = await this.handleFileUpload(task);
          break;
        case 'pdf_extract':
          result = await this.handlePdfExtract(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      task.onComplete?.(result);
    } catch (error) {
      task.onError?.(error as Error);
    } finally {
      this.running.delete(task.id);
      // 处理下一个任务
      setTimeout(() => this.processQueue(), 0);
    }
  }

  private async handleStreamMessage(task: Task): Promise<any> {
    const { payload } = task;
    
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/messages/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';
        let progress = 0;

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          console.log('Raw stream chunk:', chunk);
          accumulatedContent += chunk;
          progress += chunk.length;
          
          // 报告进度
          task.onProgress?.(progress);
          
          // 通知外部更新UI
          if (payload.onChunk) {
            console.log('Calling onChunk with content:', accumulatedContent);
            payload.onChunk(accumulatedContent);
          }
        }

        resolve({ content: accumulatedContent });
      } catch (error) {
        reject(error);
      }
    });
  }

  private async handleFileUpload(task: Task): Promise<any> {
    // 文件上传逻辑
    return new Promise((resolve) => {
      // 模拟文件上传进度
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        task.onProgress?.(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve({ success: true, url: 'uploaded_file_url' });
        }
      }, 100);
    });
  }

  private async handlePdfExtract(task: Task): Promise<any> {
    const { payload } = task;
    
    try {
      const response = await fetch('/api/pdf/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Data: payload.base64Data })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  getQueueStatus() {
    return {
      pending: this.queue.length,
      running: this.running.size,
      total: this.queue.length + this.running.size
    };
  }

  cancelTask(taskId: string): boolean {
    const index = this.queue.findIndex(task => task.id === taskId);
    if (index > -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }
}

// 单例模式
export const taskQueue = new TaskQueue();

// 便捷方法
export const addStreamMessageTask = (
  payload: any,
  onChunk: (content: string) => void,
  onComplete: (result: any) => void,
  onError: (error: Error) => void
) => {
  const taskId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  taskQueue.addTask({
    id: taskId,
    type: 'stream_message',
    payload: { ...payload, onChunk },
    onComplete,
    onError
  });
  
  return taskId;
};

export const addFileUploadTask = (
  file: File,
  onProgress: (progress: number) => void,
  onComplete: (result: any) => void,
  onError: (error: Error) => void
) => {
  const taskId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  taskQueue.addTask({
    id: taskId,
    type: 'file_upload',
    payload: { file },
    onProgress,
    onComplete,
    onError
  });
  
  return taskId;
};

export default taskQueue;
