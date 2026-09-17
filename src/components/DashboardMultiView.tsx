import React from 'react';
import { GoalPlan } from '../types';
import { calculateCurrentDayProgress, addDaysToDate, formatJapaneseDate } from '../utils/dateUtils';
import {
  Layers,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Trophy,
  Trash2,
} from 'lucide-react';

interface DashboardMultiViewProps {
  savedPlans: GoalPlan[];
  activePlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onNewGoal: () => void;
  onOpenPresets: () => void;
  onCelebrateGoal?: (plan: GoalPlan) => void;
  onDeletePlan?: (planId: string) => void;
}

export const DashboardMultiView: React.FC<DashboardMultiViewProps> = ({
  savedPlans,
  activePlanId,
  onSelectPlan,
  onNewGoal,
  onOpenPresets,
  onCelebrateGoal,
  onDeletePlan,
}) => {
  const totalPlans = savedPlans.length;
  const completedPlans = savedPlans.filter((p) =>
    p.milestones.length > 0 && p.milestones.every((m) => m.status === 'completed')
  ).length;

  const totalMilestones = savedPlans.reduce(
    (acc, p) => acc + p.milestones.length,
    0
  );
  const completedMilestones = savedPlans.reduce(
    (acc, p) =>
      acc + p.milestones.filter((m) => m.status === 'completed').length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Overview Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                全目標ダッシュボード
              </span>
              <span className="text-xs text-stone-500">
                複数の目標の中間進捗と次のチェックポイントを一望
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              進行中の目標一覧 & 中間進捗状況
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNewGoal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>新しい目標を作る</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-stone-100">
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/70">
            <div className="text-xs text-stone-500">登録目標数</div>
            <div className="text-lg sm:text-xl font-black text-stone-900 mt-0.5">
              {totalPlans}{' '}
              <span className="text-xs font-normal text-stone-500">件</span>
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/70">
            <div className="text-xs text-stone-500">中間目標の達成</div>
            <div className="text-lg sm:text-xl font-black text-amber-600 mt-0.5">
              {completedMilestones}{' '}
              <span className="text-xs font-normal text-stone-500">
                / {totalMilestones} 箇所
              </span>
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/70">
            <div className="text-xs text-stone-500">全工程完走</div>
            <div className="text-lg sm:text-xl font-black text-emerald-600 mt-0.5">
              {completedPlans}{' '}
              <span className="text-xs font-normal text-stone-500">件</span>
            </div>
          </div>

          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/70 flex flex-col justify-center">
            <span className="text-[11px] text-amber-800 font-bold block mb-0.5">
              💡 中間目標の効用
            </span>
            <span className="text-[11px] text-stone-600 leading-tight">
              直近の目安に集中することで無理なくゴールへ到達できます
            </span>
          </div>
        </div>
      </div>

      {/* Multiple Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedPlans.map((plan) => {
          const { currentDay } =
            calculateCurrentDayProgress(plan.startDate, plan.totalDays);

          const nextMilestone = plan.milestones.find(
            (m) => m.status !== 'completed'
          );
          const completedCount = plan.milestones.filter(
            (m) => m.status === 'completed'
          ).length;
          const isFinished =
            completedCount === plan.milestones.length && plan.milestones.length > 0;

          const daysToNext = nextMilestone
            ? Math.max(0, nextMilestone.day - currentDay)
            : 0;

          const isActive = plan.id === activePlanId;

          return (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                isActive
                  ? 'border-amber-400 ring-1 ring-amber-300'
                  : 'border-stone-200/90 hover:border-amber-300'
              }`}
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                      {plan.totalDays}日間
                    </span>
                    {plan.category && (
                      <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                        {plan.category === 'study' && '📚 勉強'}
                        {plan.category === 'project' && '💻 制作'}
                        {plan.category === 'habit' && '🏃 習慣'}
                        {plan.category === 'life' && '🧹 片付け'}
                        {plan.category === 'general' && '🎯 一般'}
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                      {plan.pacingStyle === 'front_loaded'
                        ? '前半逃げ切り型'
                        : plan.pacingStyle === 'steady'
                        ? '均等ペース型'
                        : plan.pacingStyle === 'ramp_up'
                        ? 'スロースタート型'
                        : '安全バッファ重視型'}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-stone-600">
                    Day {currentDay}{' '}
                    <span className="text-stone-400 font-normal">
                      / {plan.totalDays}日
                    </span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-800 transition line-clamp-2 leading-snug">
                  {plan.title}
                </h3>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span>チェックポイント進捗</span>
                    <span className="font-bold text-stone-700">
                      {completedCount} / {plan.milestones.length} 完了
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (completedCount / Math.max(1, plan.milestones.length)) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Next Milestone Spotlight or Finished Banner */}
                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200/80 group-hover:bg-amber-50/40 group-hover:border-amber-200 transition">
                  {isFinished ? (
                    <div className="flex items-center justify-between gap-2 py-1">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>全マイルストーンを完走しました！🎉</span>
                      </div>
                      {onCelebrateGoal && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCelebrateGoal(plan);
                          }}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Trophy className="w-3 h-3 text-amber-600" />
                          <span>褒め言葉を見る</span>
                        </button>
                      )}
                    </div>
                  ) : nextMilestone ? (
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 mb-1">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>直近の到達目安 (Day {nextMilestone.day}まで)</span>
                        </span>
                        <span className="text-stone-500 font-normal">
                          あと{daysToNext}日
                        </span>
                      </div>
                      <div className="text-xs font-bold text-stone-900 line-clamp-1">
                        {nextMilestone.title}
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                        {nextMilestone.targetDescription}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-500">
                      チェックポイントが未設定です
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom footer button */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="truncate max-w-[170px] sm:max-w-[220px]">
                  {formatJapaneseDate(plan.startDate)} 〜{' '}
                  {formatJapaneseDate(
                    addDaysToDate(plan.startDate, plan.totalDays)
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {onDeletePlan && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlan(plan.id);
                      }}
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="この目標計画を削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="font-bold text-amber-700 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                    <span>計画を開く</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Suggestions Banner */}
      <div className="p-4 bg-stone-100/70 rounded-xl border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
        <span>
          資格試験・制作・整理整頓・読書など、複数の異なる目標を並行して管理できます。
        </span>
        <button
          type="button"
          onClick={onOpenPresets}
          className="text-amber-700 hover:text-amber-800 font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>例文テンプレートから追加</span>
        </button>
      </div>
    </div>
  );
};
