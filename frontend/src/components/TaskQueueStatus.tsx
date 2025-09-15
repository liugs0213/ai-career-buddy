import React, { useState, useEffect } from 'react';
import { taskQueue } from '../utils/TaskQueue';
import './TaskQueueStatus.css';

const TaskQueueStatus: React.FC = () => {
  const [status, setStatus] = useState({ pending: 0, running: 0, total: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const queueStatus = taskQueue.getQueueStatus();
      setStatus(queueStatus);
      setIsVisible(queueStatus.total > 0);
    };

    // 初始更新
    updateStatus();

    // 定期更新状态
    const interval = setInterval(updateStatus, 500);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="task-queue-status">
      <div className="status-icon">
        <div className="loading-spinner"></div>
      </div>
      <div className="status-info">
        <div className="status-text">
          {status.running > 0 && (
            <span className="running">处理中: {status.running}</span>
          )}
          {status.pending > 0 && (
            <span className="pending">等待中: {status.pending}</span>
          )}
        </div>
        <div className="status-progress">
          <div 
            className="progress-bar"
            style={{ 
              width: `${status.running > 0 ? 100 : 0}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TaskQueueStatus;
