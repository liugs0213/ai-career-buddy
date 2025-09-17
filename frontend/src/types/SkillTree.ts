export interface SkillNode {
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
  courses?: string[]; // 推荐课程
  books?: string[]; // 推荐书籍
  learningTips?: string[]; // 自定义学习建议
}

export interface SkillTreeProps {
  title?: string;
  skills: SkillNode[];
  onSkillClick?: (skill: SkillNode) => void;
  className?: string;
  isEditMode?: boolean;
  onUpdateProgress?: (skillId: string, progress: number) => void;
  onToggleUnlock?: (skillId: string) => void;
  checkPrerequisites?: (skill: SkillNode) => boolean;
}

