import React, { useState } from 'react';
import { GoalPlan, Milestone } from '../types';
import { addDaysToDate, formatJapaneseDate } from '../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flag,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface CalendarViewProps {
  savedPlans: GoalPlan[];
  activePlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onSelectMilestone: (milestoneId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  savedPlans,
  activePlanId,
  onSelectPlan,
  onSelectMilestone,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const active = savedPlans.find((p) => p.id === activePlanId) || savedPlans[0];
    if (active && active.startDate) {
      const [y, m, d] = active.startDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [filterMode, setFilterMode] = useState<'active' | 'all'>('active');
  const [selectedDateDetail, setSelectedDateDetail] = useState<string | null>(null);

  const activePlan = savedPlans.find((p) => p.id === activePlanId) || savedPlans[0];

  const prevMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };
  const nextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };
  const goToday = () => {
    const d = new Date();
    setCurrentMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: {
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  })();

  // Fill prev month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dNum = totalDaysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, dNum);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(
      prevMonthDate.getMonth() + 1
    ).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
    calendarDays.push({
      dateStr,
      dayNum: dNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Fill current month days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(
      2,
      '0'
    )}`;
    calendarDays.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Fill next month days to complete rows
  const remainingSlots = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remainingSlots; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    const dateStr = `${nextMonthDate.getFullYear()}-${String(
      nextMonthDate.getMonth() + 1
    ).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  const plansToShow = filterMode === 'all' ? savedPlans : activePlan ? [activePlan] : [];

  interface CalendarEvent {
    planId: string;
    planTitle: string;
    type: 'milestone' | 'plan_start' | 'plan_end';
    milestone?: Milestone;
    dayNumber?: number;
  }

  const eventsByDate = new Map<string, CalendarEvent[]>();

  plansToShow.forEach((plan) => {
    // Start date
    const startList = eventsByDate.get(plan.startDate) || [];
    startList.push({
      planId: plan.id,
      planTitle: plan.title,
      type: 'plan_start',
      dayNumber: 1,
    });
    eventsByDate.set(plan.startDate, startList);

    // End date
    const endDate = addDaysToDate(plan.startDate, plan.totalDays);
    const endList = eventsByDate.get(endDate) || [];
    endList.push({
      planId: plan.id,
      planTitle: plan.title,
      type: 'plan_end',
      dayNumber: plan.totalDays,
    });
    eventsByDate.set(endDate, endList);

    // Milestones
    plan.milestones.forEach((m) => {
      const mDate = addDaysToDate(plan.startDate, m.day);
      const list = eventsByDate.get(mDate) || [];
      list.push({
        planId: plan.id,
        planTitle: plan.title,
        type: 'milestone',
        milestone: m,
        dayNumber: m.day,
      });
      eventsByDate.set(mDate, list);
    });
  });

  const selectedEvents = selectedDateDetail ? eventsByDate.get(selectedDateDetail) || [] : [];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
              カレンダービュー
            </span>
            <span className="text-xs text-stone-500">
              各中間目標の到達目安日を月間カレンダーで確認
            </span>
          </div>
          <h3 className="text-xl font-bold text-stone-900 flex items-center gap-3">
            <span>
              {year}年 {month + 1}月
            </span>
          </h3>
        </div>

        {/* View toggles and navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {savedPlans.length > 1 && (
            <div className="bg-stone-100 p-0.5 rounded-xl flex items-center text-xs font-medium border border-stone-200">
              <button
                type="button"
                onClick={() => setFilterMode('active')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filterMode === 'active'
                    ? 'bg-white text-stone-900 font-bold shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                選択中の目標のみ
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white text-stone-900 font-bold shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                すべての目標 ({savedPlans.length})
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl p-0.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 transition cursor-pointer"
              title="前月"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-200 rounded-lg transition cursor-pointer"
            >
              今月
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 transition cursor-pointer"
              title="次月"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Target Plan quick info */}
      {filterMode === 'active' && activePlan && (
        <div className="flex items-center justify-between text-xs bg-amber-50/60 border border-amber-200/70 p-3 rounded-xl">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="font-bold text-amber-900 truncate">
              {activePlan.title}
            </span>
            <span className="text-stone-500 hidden sm:inline shrink-0">
              ({formatJapaneseDate(activePlan.startDate)} 〜 {formatJapaneseDate(addDaysToDate(activePlan.startDate, activePlan.totalDays))})
            </span>
          </div>
          <span className="text-amber-800 font-semibold shrink-0 ml-2">
            全{activePlan.milestones.length}チェックポイント
          </span>
        </div>
      )}

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-500 border-b border-stone-100 pb-2">
        <span className="text-rose-500">日</span>
        <span>月</span>
        <span>火</span>
        <span>水</span>
        <span>木</span>
        <span>金</span>
        <span className="text-blue-500">土</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((cell, idx) => {
          const events = eventsByDate.get(cell.dateStr) || [];
          const isSelected = selectedDateDetail === cell.dateStr;

          return (
            <div
              key={idx}
              onClick={() => setSelectedDateDetail(cell.dateStr)}
              className={`min-h-[84px] sm:min-h-[96px] p-1.5 rounded-xl border transition cursor-pointer flex flex-col justify-between text-left relative group ${
                isSelected
                  ? 'ring-2 ring-amber-500 bg-amber-50/40 border-amber-300'
                  : cell.isToday
                  ? 'border-amber-400 bg-amber-50/20'
                  : cell.isCurrentMonth
                  ? 'border-stone-200/80 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                  : 'border-stone-100 bg-stone-50/30 text-stone-300'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                    cell.isToday
                      ? 'bg-amber-600 text-white'
                      : cell.isCurrentMonth
                      ? 'text-stone-800'
                      : 'text-stone-300'
                  }`}
                >
                  {cell.dayNum}
                </span>

                {cell.isToday && (
                  <span className="text-[9px] font-bold text-amber-700 uppercase">
                    今日
                  </span>
                )}
              </div>

              {/* Event Chips */}
              <div className="space-y-1 mt-1 overflow-hidden">
                {events.map((ev, eIdx) => {
                  if (ev.type === 'milestone' && ev.milestone) {
                    const isCompleted = ev.milestone.status === 'completed';
                    return (
                      <div
                        key={eIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPlan(ev.planId);
                          onSelectMilestone(ev.milestone!.id);
                        }}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border truncate transition flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 line-through'
                            : ev.milestone.isBufferStage
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-amber-100 text-amber-900 border-amber-200 group-hover:bg-amber-200/80'
                        }`}
                        title={`${ev.milestone.title}: ${ev.milestone.targetDescription}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-emerald-600" />
                        ) : ev.milestone.isBufferStage ? (
                          <ShieldCheck className="w-2.5 h-2.5 shrink-0 text-blue-600" />
                        ) : (
                          <Flag className="w-2.5 h-2.5 shrink-0 text-amber-600" />
                        )}
                        <span className="truncate">Day {ev.dayNumber}: {ev.milestone.title}</span>
                      </div>
                    );
                  }

                  if (ev.type === 'plan_start') {
                    return (
                      <div
                        key={eIdx}
                        className="text-[9px] font-semibold text-stone-600 bg-stone-100 px-1 py-0.5 rounded truncate"
                      >
                        🚀 開始: {ev.planTitle}
                      </div>
                    );
                  }

                  if (ev.type === 'plan_end') {
                    return (
                      <div
                        key={eIdx}
                        className="text-[9px] font-bold text-amber-800 bg-amber-200/70 px-1 py-0.5 rounded truncate"
                      >
                        🏁 完了予定: {ev.planTitle}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Detail Drawer */}
      {selectedDateDetail && (
        <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200/90 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-600" />
              <span>{formatJapaneseDate(selectedDateDetail)} の目安・予定</span>
            </h4>
            <button
              type="button"
              onClick={() => setSelectedDateDetail(null)}
              className="text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              閉じる
            </button>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-xs text-stone-500">
              この日に設定された中間チェックポイントはありません。日々の推奨ペースに沿って着実に進めましょう。
            </p>
          ) : (
            <div className="space-y-2.5">
              {selectedEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        {ev.type === 'milestone'
                          ? `中間目標 (Day ${ev.dayNumber})`
                          : ev.type === 'plan_start'
                          ? '目標開始日'
                          : '目標完了予定日'}
                      </span>
                      <span className="text-xs font-bold text-stone-800">
                        {ev.planTitle}
                      </span>
                    </div>

                    {ev.milestone && (
                      <div className="mt-1 space-y-1">
                        <div className="text-xs font-bold text-stone-900">
                          {ev.milestone.title}
                        </div>
                        <p className="text-xs text-stone-600">
                          💡 <strong>ここでの到達目安:</strong>{' '}
                          {ev.milestone.targetDescription}
                        </p>
                      </div>
                    )}
                  </div>

                  {ev.milestone && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPlan(ev.planId);
                        onSelectMilestone(ev.milestone!.id);
                      }}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition cursor-pointer self-start sm:self-center shrink-0 flex items-center gap-1"
                    >
                      <span>計画詳細で確認</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
