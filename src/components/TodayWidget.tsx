import React, { useState } from 'react';
import { GoalPlan, Milestone } from '../types';
import { calculateCurrentDayProgress, addDaysToDate, formatJapaneseDate } from '../utils/dateUtils';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Smile,
  Meh,
} from 'lucide-react';

interface TodayWidgetProps {
  plan: GoalPlan;
  onFocusMilestone: (milestoneId: string) => void;
}

export const TodayWidget: React.FC<TodayWidgetProps> = ({
  plan,
  onFocusMilestone,
}) => {
  const [pacingFeedback, setPacingFeedback] = useState<'good' | 'behind' | null>(null);

  const { currentDay, percentage, daysRemaining, isPastEnd } =
    calculateCurrentDayProgress(plan.startDate, plan.totalDays);

  // Find the next incomplete milestone
  const currentTargetMilestone: Milestone | undefined = plan.milestones.find(
    (m) => m.status !== 'completed'
  );

  const daysToNextMilestone = currentTargetMilestone
    ? Math.max(0, currentTargetMilestone.day - currentDay)
    : 0;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 rounded-2xl border border-amber-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Today's position */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              <Compass className="w-3.5 h-3.5 text-amber-700" />
              今日の現在地: Day {currentDay} / {plan.totalDays}日目
            </span>
            <span className="text-xs text-stone-500">
              （全体残り {daysRemaining}日）
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-stone-900">
            {currentTargetMilestone ? (
              <span>
                次は{' '}
                <span className="text-amber-700 underline decoration-amber-300 decoration-2 underline-offset-4">
                  Day {currentTargetMilestone.day} の「{currentTargetMilestone.title}」
                </span>{' '}
                を目指しましょう
              </span>
            ) : (
              <span className="text-emerald-700">
                🎉 すべての中間目標を達成しました！素晴らしいです！
              </span>
            )}
          </h3>

          {currentTargetMilestone && (
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              目安期限まであと{' '}
              <strong className="text-stone-900 font-bold">
                {daysToNextMilestone === 0 ? '本日' : `${daysToNextMilestone}日`}
              </strong>{' '}
              （{formatJapaneseDate(addDaysToDate(plan.startDate, currentTargetMilestone.day))} 頃）
            </p>
          )}
        </div>

        {/* Right: Quick action / Status */}
        {currentTargetMilestone && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onFocusMilestone(currentTargetMilestone.id)}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>この中間目標を見る</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
            </button>
          </div>
        )}
      </div>

      {/* Target description & daily pace */}
      {currentTargetMilestone && (
        <div className="mt-4 pt-4 border-t border-amber-200/50 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/80 rounded-xl p-3 border border-amber-100">
            <div className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ここまでやっておくと良い目安</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-medium">
              {currentTargetMilestone.targetDescription}
            </p>
          </div>

          <div className="bg-white/80 rounded-xl p-3 border border-amber-100 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-stone-500" />
                <span>日々のペース目安</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {plan.dailyRecommendedPace}
              </p>
            </div>

            {/* Check Pace feeling */}
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">進み具合は？:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPacingFeedback('good')}
                  className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 transition cursor-pointer ${
                    pacingFeedback === 'good'
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  <Smile className="w-3 h-3 text-emerald-600" />
                  <span>順調！</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPacingFeedback('behind')}
                  className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 transition cursor-pointer ${
                    pacingFeedback === 'behind'
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  <Meh className="w-3 h-3 text-amber-600" />
                  <span>少し遅れ気味...</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Behind schedule reassurance message if clicked */}
      {pacingFeedback === 'behind' && currentTargetMilestone && (
        <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 animate-fadeIn">
          <strong>💡 焦らなくて大丈夫！</strong> {currentTargetMilestone.recoveryTip}
        </div>
      )}
    </div>
  );
};
