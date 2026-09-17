import React, { useState } from 'react';
import { Milestone, GoalPlan } from '../types';
import { addDaysToDate, formatJapaneseDate } from '../utils/dateUtils';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  LifeBuoy,
  Edit2,
  Trash2,
  Plus,
  Calendar,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  plan: GoalPlan;
  currentDay: number;
  onToggleChecklistItem: (milestoneId: string, itemId: string) => void;
  onAddChecklistItem: (milestoneId: string, text: string) => void;
  onUpdateStatus: (milestoneId: string, status: Milestone['status']) => void;
  onUpdateNotes: (milestoneId: string, notes: string) => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onCelebrate?: (milestone: Milestone) => void;
  isSelected?: boolean;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  index,
  plan,
  currentDay,
  onToggleChecklistItem,
  onAddChecklistItem,
  onUpdateStatus,
  onUpdateNotes,
  onEditMilestone,
  onDeleteMilestone,
  onCelebrate,
  isSelected,
}) => {
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [notes, setNotes] = useState(milestone.userNotes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const targetDate = addDaysToDate(plan.startDate, milestone.day);
  const formattedDate = formatJapaneseDate(targetDate);
  const isCompleted = milestone.status === 'completed';
  const isBuffer = milestone.isBufferStage;
  const isOverdue = currentDay > milestone.day && !isCompleted;
  const isCurrentTarget =
    !isCompleted &&
    (index === 0 || plan.milestones[index - 1]?.status === 'completed');

  const completedChecklistCount = milestone.checklistItems.filter(
    (c) => c.completed
  ).length;

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    onAddChecklistItem(milestone.id, newChecklistText.trim());
    setNewChecklistText('');
    setIsAddingItem(false);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(milestone.id, notes);
    setIsEditingNotes(false);
  };

  return (
    <div
      id={`milestone-${milestone.id}`}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
        isSelected
          ? 'ring-2 ring-amber-500 border-amber-300'
          : isCompleted
          ? 'bg-stone-50/70 border-emerald-200'
          : isCurrentTarget
          ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-200'
          : isBuffer
          ? 'bg-blue-50/30 border-blue-200'
          : 'bg-white border-stone-200/90'
      }`}
    >
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-100">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() =>
              onUpdateStatus(
                milestone.id,
                isCompleted ? 'not_started' : 'completed'
              )
            }
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs'
                : isCurrentTarget
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600'
            }`}
            title={isCompleted ? '未完了に戻す' : 'この中間目標を達成済みにする'}
          >
            {isCompleted ? (
              <Check className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <span className="text-sm font-bold">{index + 1}</span>
            )}
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-700" />
                Day {milestone.day} まで （{formattedDate} 頃）
              </span>

              <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                進捗目安: 約{milestone.percentage}%
              </span>

              {milestone.stageType && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    milestone.stageType === 'setup'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                      : milestone.stageType === 'practice'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200/60'
                      : milestone.stageType === 'refine'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                      : milestone.stageType === 'buffer'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  }`}
                >
                  {milestone.stageType === 'setup' && '🌱 立ち上げ・導入'}
                  {milestone.stageType === 'practice' && '⚡ コア実践・制作'}
                  {milestone.stageType === 'refine' && '🎯 演習・ブラッシュアップ'}
                  {milestone.stageType === 'buffer' && '🛡️ バッファ・総復習'}
                  {milestone.stageType === 'finish' && '🏆 完走・最終完了'}
                </span>
              )}

              {isBuffer && !milestone.stageType && (
                <span className="text-xs font-medium text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  予備・調整期間
                </span>
              )}

              {isOverdue && (
                <span className="text-xs font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                  目安日を経過（調整中）
                </span>
              )}

              {isCurrentTarget && (
                <span className="text-xs font-bold text-amber-800 bg-amber-200/90 px-2.5 py-0.5 rounded-md animate-pulse">
                  📍 現在のフォーカス目標
                </span>
              )}
            </div>

            <h3
              className={`text-base sm:text-lg font-bold mt-1 text-stone-900 truncate ${
                isCompleted ? 'line-through text-stone-400' : ''
              }`}
            >
              {milestone.title}
            </h3>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 ml-auto">
          {isCompleted && onCelebrate && (
            <button
              type="button"
              onClick={() => onCelebrate(milestone)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition cursor-pointer shadow-2xs"
              title="達成メッセージ・褒め言葉を見る"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>褒め言葉</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEditMilestone(milestone)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            title="この中間目標を編集する"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteMilestone(milestone.id)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="削除する"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* THE CORE: "大体この辺でここまでやっとくといいよ" ボックス */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5 text-amber-800 font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>大体この辺でここまでやっておくと良い目安</span>
            </div>
            <p className="text-sm font-medium text-stone-800 leading-relaxed">
              {milestone.targetDescription}
            </p>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700">
              <span className="flex items-center gap-1.5">
                <span>チェックリスト（具体的なアクション）</span>
                <span className="text-stone-400 font-normal">
                  ({completedChecklistCount}/{milestone.checklistItems.length})
                </span>
              </span>
              {!isAddingItem && (
                <button
                  type="button"
                  onClick={() => setIsAddingItem(true)}
                  className="text-amber-700 hover:text-amber-800 font-medium inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>項目を追加</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {milestone.checklistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onToggleChecklistItem(milestone.id, item.id)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg transition cursor-pointer group ${
                    item.completed
                      ? 'bg-stone-50/60 text-stone-400'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-300 group-hover:text-amber-500" />
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm leading-relaxed ${
                      item.completed ? 'line-through text-stone-400' : ''
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Add checklist inline form */}
            {isAddingItem && (
              <form onSubmit={handleAddChecklist} className="flex gap-2 mt-2">
                <input
                  type="text"
                  autoFocus
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="追加したいタスクや目安を入力..."
                  className="flex-1 text-xs px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition cursor-pointer"
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="text-xs px-2 py-1.5 text-stone-500 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                >
                  キャンセル
                </button>
              </form>
            )}
          </div>

          {/* Two Pillars: Check Question & Recovery Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Check Question */}
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>ここでのチェックポイント（自分への問い）</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic">
                「{milestone.checkQuestion}」
              </p>
            </div>

            {/* Recovery Tip */}
            <div className="bg-emerald-50/40 rounded-xl p-3 border border-emerald-200/70">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                <LifeBuoy className="w-3.5 h-3.5 text-emerald-600" />
                <span>もし遅れていたら？（安心リカバリー策）</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {milestone.recoveryTip}
              </p>
            </div>
          </div>

          {/* User Notes Area */}
          <div className="pt-2 border-t border-stone-100">
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="このマイルストーンに関するメモ、読んだページ数、気づきなど..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-stone-800"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="text-xs px-2.5 py-1 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700 cursor-pointer"
                  >
                    メモを保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(false)}
                    className="text-xs px-2 py-1 text-stone-500 hover:bg-stone-100 rounded-md cursor-pointer"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-stone-500">
                <div className="truncate max-w-[85%]">
                  {milestone.userNotes ? (
                    <span className="text-stone-700 font-medium">
                      📝 {milestone.userNotes}
                    </span>
                  ) : (
                    <span className="text-stone-400 italic">
                      進捗メモや気づきを残せます
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
                >
                  {milestone.userNotes ? '編集' : '＋メモを書く'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
