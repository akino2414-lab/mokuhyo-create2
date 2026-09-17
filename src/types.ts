export type PacingStyle = 'front_loaded' | 'steady' | 'ramp_up' | 'buffer_first';

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
  icon: string;
  status: string;
  dailyTime: string;
  pacingStyle: PacingStyle;
  sampleSummary: string;
}
