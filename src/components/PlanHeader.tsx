import React, { useState } from 'react';
import { GoalPlan } from '../types';
import {
  Calendar,
  Share2,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Trophy,
  Sparkles,
  Zap,
} from 'lucide-react';
import { exportPlanAsMarkdown, formatJapaneseDate, addDaysToDate } from '../utils/dateUtils';

interface PlanHeaderProps {
  plan: GoalPlan;
  onAddMilestone: () => void;
  onDeletePlan: () => void;
  onNewGoal: () => void;
  onReBreakdown: () => void;
  isReBreakdownLoading?: boolean;
}

export const PlanHeader: React.FC<PlanHeaderProps> = ({
  plan,
  onAddMilestone,
  onDeletePlan,
  onNewGoal,
  onReBreakdown,
  isReBreakdownLoading,
}) => {
  const [copied, setCopied] = useState(false);

  const isAllCompleted =
    plan.milestones.length > 0 &&
    plan.milestones.every((m) => m.status === 'completed');

  const handleCopyMarkdown = () => {
    const text = exportPlanAsMarkdown(plan);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pacingLabels: Record<string, string> = {
    front_loaded: '🚀 前半逃げ切り型',
    steady: '⚖️ 均等ペース型',
    ramp_up: '🐢 スロースタート型',
    buffer_first: '🛡️ 安全バッファ重視型',
  };

  return (
    <div className="space-y-4">
      {/* Celebration Banner if finished */}
      {isAllCompleted && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md animate-fadeIn flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Trophy className="w-7 h-7 text-amber-100 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold">
              🎉 全ての中間チェックポイントを達成しました！
            </h3>
            <p className="text-xs sm:text-sm text-amber-100 mt-0.5 leading-relaxed">
              {plan.celebrationMessage ||
                `「${plan.title}」を${plan.totalDays}日間のペース配分で見事に完走しました！`}
            </p>
          </div>
        </div>
      )}

      {/* Main Plan Title & Action Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {plan.totalDays}日間プラン
              </span>
              <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
                {pacingLabels[plan.pacingStyle] || 'ペース配分'}
              </span>
              <span className="text-xs text-stone-400">
                作成: {formatJapaneseDate(plan.createdAt?.split('T')[0] || plan.startDate)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-snug break-words">
              {plan.title}
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
              {plan.summary}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={onAddMilestone}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200/80 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-600" />
              <span>中間目標を追加</span>
            </button>

            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition cursor-pointer"
              title="計画をMarkdown形式でクリップボードにコピー"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">コピー完了！</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-500" />
                  <span>計画をコピー</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onDeletePlan}
              className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="この目標計画を削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pacing Advice Bar */}
        <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2 text-stone-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100/60">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 block mb-0.5">
                ペース配分のポイント:
              </strong>
              <span>{plan.pacingAdvice}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200/70">
            <Calendar className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 block mb-0.5">
                日々の推奨ペース目安:
              </strong>
              <span>{plan.dailyRecommendedPace}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
