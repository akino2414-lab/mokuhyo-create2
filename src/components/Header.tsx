import React from 'react';
import { Target, Sparkles, FolderOpen, Plus } from 'lucide-react';
import { GoalPlan } from '../types';

interface HeaderProps {
  onNewGoal: () => void;
  onOpenPresets: () => void;
  savedPlans: GoalPlan[];
  activePlanId: string | null;
  onSelectPlan: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewGoal,
  onOpenPresets,
  savedPlans,
  activePlanId,
  onSelectPlan,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-stone-900 tracking-tight truncate">
                中間目標プランナー
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                ペース設計
              </span>
            </div>
            <p className="text-xs text-stone-500 truncate hidden md:block">
              「◯日でここまで」の漠然とした目標を、安心できる中間目安に分解
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Saved Plans Selector if multiple */}
          {savedPlans.length > 1 && (
            <div className="relative">
              <select
                id="goal-plan-selector"
                value={activePlanId || ''}
                onChange={(e) => onSelectPlan(e.target.value)}
                className="text-xs bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-300/80 rounded-lg px-2.5 py-1.5 font-medium transition cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
              >
                {savedPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            id="open-presets-btn"
            onClick={onOpenPresets}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition cursor-pointer"
            title="よくある目標のテンプレートから選ぶ"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">例文・テンプレート</span>
            <span className="sm:hidden">例</span>
          </button>

          <button
            id="new-goal-btn"
            onClick={onNewGoal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>新しい目標を作る</span>
          </button>
        </div>
      </div>
    </header>
  );
};
