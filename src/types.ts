export type PacingStyle = 'front_loaded' | 'steady' | 'ramp_up' | 'buffer_first';

export type GoalCategory =
  | 'study' // 勉強・資格・読書
  | 'project' // 制作・開発・仕事・副業
  | 'habit' // 習慣・健康・ダイエット
  | 'life' // 生活・片付け・断捨離
  | 'general'; // その他・汎用

export type MilestoneStageType =
  | 'setup' // 準備・インプット・環境構築
  | 'practice' // 実践・制作・コア作業
  | 'refine' // 改善・過去問・ブラッシュアップ
  | 'buffer' // 予備日・調整・総復習
  | 'finish'; // 最終完了・公開・本番

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed';

export interface MilestoneChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  day: number;
  percentage: number;
  title: string;
  targetDescription: string;
  checklistItems: MilestoneChecklistItem[];
  checkQuestion: string;
  recoveryTip: string;
  isBufferStage?: boolean;
  stageType?: MilestoneStageType;
  status: MilestoneStatus;
  userNotes?: string;
  completedAt?: string;
}

export interface GoalPlan {
  id: string;
  title: string;
  createdAt: string;
  startDate: string;
  totalDays: number;
  category?: GoalCategory;
  currentStatus: string;
  dailyTime: string;
  pacingStyle: PacingStyle;
  customNotes?: string;
  summary: string;
  pacingAdvice: string;
  dailyRecommendedPace: string;
  celebrationMessage?: string;
  milestones: Milestone[];
  isCompleted?: boolean;
}

export interface PresetGoal {
  id: string;
  title: string;
  days: number;
  category: string;
  goalCategory?: GoalCategory;
  icon: string;
  status: string;
  dailyTime: string;
  pacingStyle: PacingStyle;
  sampleSummary: string;
}

export type AppViewMode = 'plan' | 'calendar' | 'dashboard';
