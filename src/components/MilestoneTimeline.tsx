import React from 'react';
import { Milestone, GoalPlan } from '../types';
import {
  calculateCurrentDayProgress,
  formatJapaneseDate,
  addDaysToDate,
} from '../utils/dateUtils';
import { Flag, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MilestoneTimelineProps {
  plan: GoalPlan;
  onSelectMilestone?: (milestoneId: string) => void;
  selectedMilestoneId?: string;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  plan,
  onSelectMilestone,
  selectedMilestoneId,
}) => {
  const { currentDay, percentage, daysRemaining, isPastEnd } =
    calculateCurrentDayProgress(plan.startDate, plan.totalDays);

  const completedCount = plan.milestones.filter(
    (m) => m.status === 'completed'
  ).length;
  const totalCount = plan.milestones.length;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              ロードマップ進捗
            </span>
            <span className="text-xs text-stone-500">
              {formatJapaneseDate(plan.startDate)} スタート 〜{' '}
              {formatJapaneseDate(addDaysToDate(plan.startDate, plan.totalDays))} 完了予定
            </span>
          </div>
          <h3 className="text-lg font-bold text-stone-900">
            中間目標タイムライン & 到達目安マップ
          </h3>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs text-stone-500">現在地</div>
            <div className="text-sm font-bold text-stone-900">
              Day {currentDay}{' '}
              <span className="text-stone-400 font-normal">/ {plan.totalDays}日</span>
            </div>
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <div className="text-right">
            <div className="text-xs text-stone-500">チェックポイント達成</div>
            <div className="text-sm font-bold text-amber-600">
              {completedCount}{' '}
              <span className="text-stone-400 font-normal">/ {totalCount}完了</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar with Milestones */}
      <div className="relative pt-6 pb-2 px-2">
        {/* The Track */}
        <div className="h-2.5 w-full bg-stone-100 rounded-full relative overflow-hidden border border-stone-200/60">
          {/* Fill based on current day progress */}
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Milestones markers along the bar */}
        <div className="relative -mt-4.5 w-full flex justify-between">
          {plan.milestones.map((m, idx) => {
            const isCompleted = m.status === 'completed';
            const isBuffer = m.isBufferStage;
            const isSelected = selectedMilestoneId === m.id;
            const targetDay = m.day;
            const isDuePassed = currentDay > targetDay && !isCompleted;
            const isCurrentFocus =
              !isCompleted &&
              (idx === 0 || plan.milestones[idx - 1].status === 'completed');

            // Proportion of this milestone across total days
            const leftPercent = Math.min(
              100,
              Math.max(0, (targetDay / plan.totalDays) * 100)
            );

            return (
              <div
                key={m.id}
                onClick={() => onSelectMilestone?.(m.id)}
                style={{ left: `${leftPercent}%` }}
                className="absolute -translate-x-1/2 flex flex-col items-center group cursor-pointer"
              >
                {/* Node circle */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                      : isDuePassed
                      ? 'bg-rose-500 text-white ring-2 ring-rose-200'
                      : isCurrentFocus
                      ? 'bg-amber-600 text-white ring-4 ring-amber-200 scale-110'
                      : isBuffer
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                      : 'bg-white text-stone-600 border-2 border-stone-300 group-hover:border-amber-500'
                  } ${isSelected ? 'ring-3 ring-amber-500' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isDuePassed ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : isBuffer ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Day label */}
                <div className="mt-1 text-center whitespace-nowrap">
                  <span className="text-[11px] font-bold text-stone-700 group-hover:text-amber-600 transition">
                    Day {m.day}
                  </span>
                  {isBuffer && (
                    <span className="block text-[9px] text-blue-600 font-medium">
                      予備日
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Advice Callout */}
      <div className="mt-8 pt-4 border-t border-stone-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>達成済み</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>次の目標</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>予備日・バッファ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <span>未到達</span>
          </div>
        </div>

        <div className="text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
          💡 <strong>アドバイス:</strong> {plan.pacingAdvice}
        </div>
      </div>
    </div>
  );
};
