import React, { useState } from 'react';
import './Timeline.css';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'task' | 'goal' | 'achievement';
  status: 'completed' | 'in-progress' | 'pending' | 'cancelled';
  icon?: string;
  color?: string;
}

interface TimelineProps {
  title?: string;
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  className?: string;
}

const Timeline: React.FC<TimelineProps> = ({
  title = "时间轴",
  events,
  onEventClick,
  className = ""
}) => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const getEventIcon = (type: string) => {
    if (type === 'milestone') return '🎯';
    if (type === 'task') return '📋';
    if (type === 'goal') return '🎯';
    if (type === 'achievement') return '🏆';
    return '📅';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in-progress': return '进行中';
      case 'pending': return '待开始';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'milestone': return '里程碑';
      case 'task': return '任务';
      case 'goal': return '目标';
      case 'achievement': return '成就';
      default: return '事件';
    }
  };

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(selectedEvent === event.id ? null : event.id);
    onEventClick?.(event);
  };

  // 按日期排序事件
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className={`timeline ${className}`}>
      {title && <h3 className="timeline-title">{title}</h3>}
      
      <div className="timeline-container">
        {sortedEvents.map((event, index) => (
          <div
            key={event.id}
            className={`timeline-event ${event.status} ${selectedEvent === event.id ? 'selected' : ''}`}
            onClick={() => handleEventClick(event)}
          >
            <div className="timeline-marker">
              <div 
                className="marker-circle"
                style={{ backgroundColor: event.color || getStatusColor(event.status) }}
              >
                <span className="marker-icon">
                  {event.icon || getEventIcon(event.type)}
                </span>
              </div>
              {index < sortedEvents.length - 1 && (
                <div className="timeline-line" />
              )}
            </div>
            
            <div className="timeline-content">
              <div className="event-header">
                <h4 className="event-title">{event.title}</h4>
                <div className="event-meta">
                  <span className="event-date">{event.date}</span>
                  <span 
                    className="event-status"
                    style={{ color: getStatusColor(event.status) }}
                  >
                    {getStatusText(event.status)}
                  </span>
                </div>
              </div>
              
              <p className="event-description">{event.description}</p>
              
              <div className="event-tags">
                <span className="event-type">{getTypeText(event.type)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedEvent && (
        <div className="event-details">
          <h4>事件详情</h4>
          <p>ID: {selectedEvent}</p>
          <p>类型: {getTypeText(events.find(e => e.id === selectedEvent)?.type || '')}</p>
          <p>状态: {getStatusText(events.find(e => e.id === selectedEvent)?.status || '')}</p>
          <p>日期: {events.find(e => e.id === selectedEvent)?.date}</p>
        </div>
      )}
    </div>
  );
};

// 预设的职业发展时间轴
export const CareerDevelopmentTimeline: React.FC = () => {
  const events: TimelineEvent[] = [
    {
      id: 'career-start',
      title: '开始职业生涯',
      description: '进入技术岗位，开始积累基础技能和经验',
      date: '2020-01-01',
      type: 'milestone',
      status: 'completed',
      icon: '🚀',
      color: '#10b981'
    },
    {
      id: 'skill-learning',
      title: '技能学习阶段',
      description: '学习新技术，提升专业技能，参与项目实践',
      date: '2020-06-01',
      type: 'task',
      status: 'completed',
      icon: '📚',
      color: '#3b82f6'
    },
    {
      id: 'team-lead',
      title: '团队领导机会',
      description: '开始承担团队领导责任，管理小团队项目',
      date: '2022-03-01',
      type: 'milestone',
      status: 'completed',
      icon: '👥',
      color: '#8b5cf6'
    },
    {
      id: 'management-training',
      title: '管理技能培训',
      description: '参加管理培训课程，学习团队管理和沟通技巧',
      date: '2022-09-01',
      type: 'task',
      status: 'in-progress',
      icon: '🎓',
      color: '#f59e0b'
    },
    {
      id: 'management-role',
      title: '正式管理岗位',
      description: '成功转型到管理岗位，负责团队管理和项目规划',
      date: '2023-06-01',
      type: 'goal',
      status: 'pending',
      icon: '🎯',
      color: '#ef4444'
    },
    {
      id: 'senior-management',
      title: '高级管理职位',
      description: '晋升到高级管理职位，制定战略规划，影响公司发展',
      date: '2025-01-01',
      type: 'achievement',
      status: 'pending',
      icon: '🏆',
      color: '#06b6d4'
    }
  ];

  return (
    <Timeline
      title="职业发展时间轴"
      events={events}
      onEventClick={(event) => console.log('点击事件:', event)}
    />
  );
};

// 预设的技能提升时间轴
export const SkillDevelopmentTimeline: React.FC = () => {
  const events: TimelineEvent[] = [
    {
      id: 'skill-assessment',
      title: '技能现状评估',
      description: '评估当前技能水平，识别技能缺口和改进方向',
      date: '2024-01-01',
      type: 'milestone',
      status: 'completed',
      icon: '🔍',
      color: '#10b981'
    },
    {
      id: 'learning-plan',
      title: '制定学习计划',
      description: '根据评估结果制定详细的学习计划和目标',
      date: '2024-01-15',
      type: 'task',
      status: 'completed',
      icon: '📋',
      color: '#3b82f6'
    },
    {
      id: 'online-courses',
      title: '在线课程学习',
      description: '开始学习相关在线课程，提升理论知识',
      date: '2024-02-01',
      type: 'task',
      status: 'in-progress',
      icon: '💻',
      color: '#f59e0b'
    },
    {
      id: 'practice-projects',
      title: '实践项目',
      description: '通过实际项目应用所学知识，积累实践经验',
      date: '2024-04-01',
      type: 'task',
      status: 'pending',
      icon: '🛠️',
      color: '#8b5cf6'
    },
    {
      id: 'skill-certification',
      title: '技能认证',
      description: '获得相关技能认证，证明专业能力',
      date: '2024-06-01',
      type: 'goal',
      status: 'pending',
      icon: '🏅',
      color: '#ef4444'
    },
    {
      id: 'skill-mastery',
      title: '技能精通',
      description: '达到技能精通水平，能够独立解决复杂问题',
      date: '2024-12-01',
      type: 'achievement',
      status: 'pending',
      icon: '🎯',
      color: '#06b6d4'
    }
  ];

  return (
    <Timeline
      title="技能提升时间轴"
      events={events}
      onEventClick={(event) => console.log('点击事件:', event)}
    />
  );
};

export default Timeline;
