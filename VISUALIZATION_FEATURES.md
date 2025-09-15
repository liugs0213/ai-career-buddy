# AI职场管家 - 可视化功能指南

## 🎨 功能概述

AI职场管家现在支持智能可视化功能，能够根据用户的对话内容自动生成相关的图表和可视化组件，让职场咨询更加直观和易懂。

## 📊 可视化组件

### 1. **流程图组件** 📊

#### 功能特点：
- **交互式节点**: 点击节点查看详细信息
- **多种节点类型**: 开始、过程、决策、结束节点
- **连接线**: 显示流程关系
- **预设模板**: 职业转型、技能提升等流程图

#### 预设流程图：
- **职业转型流程图**: 技术岗位 → 管理岗位的完整路径
- **技能提升流程图**: 从现状到精通的提升过程

#### 使用方法：
```tsx
import FlowChart, { CareerTransitionFlow } from './components/FlowChart';

<FlowChart
  title="职业转型流程"
  nodes={nodes}
  connections={connections}
  onNodeClick={(node) => console.log('点击节点:', node)}
/>
```

### 2. **思维导图组件** 🧠

#### 功能特点：
- **层级结构**: 支持多层级节点展开/收起
- **图标支持**: 每个节点可配置图标
- **颜色区分**: 不同层级使用不同颜色
- **交互式**: 点击节点展开/收起子节点

#### 预设思维导图：
- **职业规划思维导图**: 自我评估、市场调研、目标设定、行动计划
- **技能提升思维导图**: 技术技能、软技能、学习方法

#### 使用方法：
```tsx
import MindMap, { CareerPlanningMindMap } from './components/MindMap';

<MindMap
  title="职业规划思维导图"
  data={mindMapData}
  onNodeClick={(node) => console.log('点击节点:', node)}
/>
```

### 3. **时间轴组件** ⏰

#### 功能特点：
- **时间排序**: 自动按时间顺序排列事件
- **状态标识**: 已完成、进行中、待开始、已取消
- **事件类型**: 里程碑、任务、目标、成就
- **进度显示**: 可视化显示完成进度

#### 预设时间轴：
- **职业发展时间轴**: 从职场新人到高级管理的完整时间线
- **技能提升时间轴**: 技能学习和认证的时间规划

#### 使用方法：
```tsx
import Timeline, { CareerDevelopmentTimeline } from './components/Timeline';

<Timeline
  title="职业发展时间轴"
  events={timelineEvents}
  onEventClick={(event) => console.log('点击事件:', event)}
/>
```

### 4. **技能树组件** 🌳

#### 功能特点：
- **技能层级**: 按技能等级和类别分组
- **前置条件**: 显示技能学习的前置要求
- **进度跟踪**: 可视化显示技能掌握程度
- **解锁机制**: 未解锁的技能显示为灰色

#### 预设技能树：
- **技术技能树**: 编程基础 → 数据结构 → 算法设计 → 系统设计
- **管理技能树**: 项目管理 → 团队建设 → 绩效管理 → 变革管理

#### 使用方法：
```tsx
import SkillTree, { TechnicalSkillTree } from './components/SkillTree';

<SkillTree
  title="技术技能树"
  skills={skillData}
  onSkillClick={(skill) => console.log('点击技能:', skill)}
/>
```

## 🤖 智能可视化面板

### 功能特点：
- **智能识别**: 根据对话内容自动选择最适合的可视化类型
- **动态切换**: 支持在不同可视化类型间切换
- **上下文感知**: 根据当前标签页显示相关预设内容
- **响应式设计**: 支持桌面端和移动端

### 智能识别规则：
```typescript
// 流程图关键词
if (text.includes('流程') || text.includes('步骤') || text.includes('转型')) {
  return 'flowchart';
}

// 思维导图关键词
if (text.includes('分析') || text.includes('规划') || text.includes('框架')) {
  return 'mindmap';
}

// 时间轴关键词
if (text.includes('时间') || text.includes('计划') || text.includes('阶段')) {
  return 'timeline';
}

// 技能树关键词
if (text.includes('技能') || text.includes('能力') || text.includes('学习')) {
  return 'skilltree';
}
```

### 使用方法：
```tsx
import VisualizationPanel from './components/VisualizationPanel';

<VisualizationPanel
  activeTab="career"
  userInput="我想从技术岗位转向管理岗位"
  aiResponse="这是一个很好的职业发展选择..."
/>
```

## 🎯 使用场景

### 1. **职业规划咨询**
- **流程图**: 展示职业转型的具体步骤
- **思维导图**: 分析职业规划的各个维度
- **时间轴**: 制定职业发展的时间计划
- **技能树**: 了解管理岗位所需的技能

### 2. **技能提升指导**
- **流程图**: 展示技能学习的完整流程
- **思维导图**: 分析技能体系的构成
- **时间轴**: 制定技能提升的时间规划
- **技能树**: 了解技能之间的依赖关系

### 3. **Offer分析**
- **流程图**: 展示Offer评估的决策流程
- **思维导图**: 分析Offer的各个考虑因素
- **时间轴**: 制定Offer决策的时间计划

### 4. **合同审查**
- **流程图**: 展示合同审查的检查流程
- **思维导图**: 分析合同条款的各个风险点
- **时间轴**: 制定合同修改的时间计划

## 🎨 样式定制

### CSS变量：
```css
:root {
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --border-color: #e2e8f0;
}
```

### 主题定制：
```css
/* 职业规划主题 */
.visualization-panel.theme-career .panel-title {
  color: #3b82f6;
}

/* Offer分析主题 */
.visualization-panel.theme-offer .panel-title {
  color: #8b5cf6;
}

/* 合同审查主题 */
.visualization-panel.theme-contract .panel-title {
  color: #ef4444;
}

/* 企业监控主题 */
.visualization-panel.theme-monitor .panel-title {
  color: #06b6d4;
}
```

## 📱 响应式设计

### 桌面端 (>768px)：
- 聊天区域和可视化面板并排显示
- 可视化面板宽度：400px
- 支持展开/收起功能

### 移动端 (≤768px)：
- 聊天区域和可视化面板垂直排列
- 可视化面板高度：最大300px
- 自动滚动查看内容

## 🔧 技术实现

### 组件架构：
```
VisualizationPanel (智能面板)
├── FlowChart (流程图)
├── MindMap (思维导图)
├── Timeline (时间轴)
└── SkillTree (技能树)
```

### 数据流：
```
用户输入 → 智能识别 → 选择组件 → 渲染可视化 → 用户交互
```

### 性能优化：
- **懒加载**: 组件按需加载
- **虚拟滚动**: 大量数据时使用虚拟滚动
- **缓存机制**: 缓存计算结果
- **防抖处理**: 避免频繁重新渲染

## 🚀 扩展功能

### 计划功能：
1. **自定义图表**: 用户可自定义图表样式和内容
2. **数据导出**: 支持导出图表为图片或PDF
3. **协作功能**: 多用户协作编辑图表
4. **模板库**: 提供更多预设模板
5. **动画效果**: 添加更丰富的动画效果

### 技术优化：
1. **WebGL渲染**: 使用WebGL提升渲染性能
2. **离线支持**: 支持离线使用
3. **实时同步**: 实时同步图表状态
4. **AI生成**: 使用AI自动生成图表内容
5. **语音交互**: 支持语音控制图表

## 📊 数据模型

### 流程图数据：
```typescript
interface FlowNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  position: { x: number; y: number };
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

interface FlowConnection {
  from: string;
  to: string;
  label?: string;
  type?: 'solid' | 'dashed';
}
```

### 思维导图数据：
```typescript
interface MindMapNode {
  id: string;
  text: string;
  level: number;
  parentId?: string;
  children?: MindMapNode[];
  color?: string;
  icon?: string;
  expanded?: boolean;
}
```

### 时间轴数据：
```typescript
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
```

### 技能树数据：
```typescript
interface SkillNode {
  id: string;
  name: string;
  description: string;
  level: number;
  category: string;
  prerequisites?: string[];
  progress: number; // 0-100
  isUnlocked: boolean;
  icon?: string;
  color?: string;
}
```

## 🎉 总结

通过这套完整的可视化功能，AI职场管家现在能够：

1. **智能识别**用户需求，自动选择最适合的可视化方式
2. **直观展示**复杂的职场概念和流程
3. **交互式体验**，用户可以点击、展开、查看详细信息
4. **响应式设计**，支持各种设备和使用场景
5. **可扩展架构**，易于添加新的可视化组件

这些功能大大提升了用户体验，让职场咨询变得更加生动、直观和易于理解！🎯
