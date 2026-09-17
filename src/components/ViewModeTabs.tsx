import React from 'react';
import { AppViewMode } from '../types';
import { LayoutList, Calendar, Layers } from 'lucide-react';

interface ViewModeTabsProps {
  currentView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  savedPlansCount: number;
}

export const ViewModeTabs: React.FC<ViewModeTabsProps> = ({
  currentView,
  onViewChange,
  savedPlansCount,
}) => {
  return (
    <div className="flex items-center justify-start">
      <div className="inline-flex p-1 bg-stone-200/80 rounded-xl border border-stone-300/70 shadow-2xs">
        <button
          type="button"
          onClick={() => onViewChange('plan')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            currentView === 'plan'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          <LayoutList className="w-3.5 h-3.5 text-amber-600" />
          <span>目標プラン</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('calendar')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            currentView === 'calendar'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>カレンダー</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('dashboard')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            currentView === 'dashboard'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>複数目標ダッシュボード</span>
          <span className="text-[10px] font-bold bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded-full">
            {savedPlansCount}
          </span>
        </button>
      </div>
    </div>
  );
};
