import React, { useState, useEffect } from 'react';
import { Milestone, GoalPlan } from '../types';
import { X, Calendar, Flag, ShieldCheck } from 'lucide-react';
import { addDaysToDate, formatJapaneseDate } from '../utils/dateUtils';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneToEdit?: Milestone | null;
  onSave: (milestoneData: Partial<Milestone>) => void;
  plan: GoalPlan;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  milestoneToEdit,
  onSave,
  plan,
}) => {
  const [day, setDay] = useState(7);
  const [title, setTitle] = useState('');
  const [targetDescription, setTargetDescription] = useState('');
  const [checkQuestion, setCheckQuestion] = useState('');
  const [recoveryTip, setRecoveryTip] = useState('');
  const [isBufferStage, setIsBufferStage] = useState(false);
  const [checklistText, setChecklistText] = useState('');

  useEffect(() => {
    if (milestoneToEdit) {
      setDay(milestoneToEdit.day);
      setTitle(milestoneToEdit.title);
      setTargetDescription(milestoneToEdit.targetDescription);
      setCheckQuestion(milestoneToEdit.checkQuestion);
      setRecoveryTip(milestoneToEdit.recoveryTip);
      setIsBufferStage(!!milestoneToEdit.isBufferStage);
      setChecklistText(
        milestoneToEdit.checklistItems.map((c) => c.text).join('\n')
      );
    } else {
      // Defaults for adding new milestone
      setDay(Math.min(plan.totalDays, Math.round(plan.totalDays / 2)));
      setTitle('');
      setTargetDescription('');
      setCheckQuestion('ここまで予定通り進められていますか？');
      setRecoveryTip('少し遅れていても、重要度の高いものに絞れば大丈夫です。');
      setIsBufferStage(false);
      setChecklistText('');
    }
  }, [milestoneToEdit, plan.totalDays, isOpen]);

  if (!isOpen) return null;

  const targetDate = addDaysToDate(plan.startDate, day);
  const formattedDate = formatJapaneseDate(targetDate);
  const percentage = Math.min(100, Math.round((day / plan.totalDays) * 100));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDescription.trim()) return;

    const checklistItems = checklistText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `chk-${Date.now()}-${idx}`,
        text,
        completed: false,
      }));

    onSave({
      day: Number(day),
      percentage,
      title: title.trim(),
      targetDescription: targetDescription.trim(),
      checkQuestion: checkQuestion.trim() || 'ここまで予定通り進められていますか？',
      recoveryTip:
        recoveryTip.trim() || '少し遅れていても、無理せずペースを取り戻しましょう。',
      isBufferStage,
      checklistItems:
        checklistItems.length > 0
          ? checklistItems
          : [
              {
                id: `chk-${Date.now()}-0`,
                text: 'この目標の主要タスクを完了する',
                completed: false,
              },
            ],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-stone-200">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-stone-900">
            {milestoneToEdit ? '中間目標を編集' : '新しい中間目標を追加'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Day setting */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>到達目安の日数（開始から何日目？）</span>
              </label>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                Day {day} ({formattedDate}頃 / 全体の約{percentage}%)
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={plan.totalDays}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              中間目標のタイトル <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 第1章の読破と基本用語の整理"
              className="w-full text-xs px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Target Description */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              大体この辺でここまでやっておくと良い目安 <span className="text-amber-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={targetDescription}
              onChange={(e) => setTargetDescription(e.target.value)}
              placeholder="例: テキストの第3章までを流し読みし、練習問題の解き方のパターンを掴んでおく。細かい暗記は後回しでOK。"
              className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Checklist items */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              チェックリスト項目（1行に1項目）
            </label>
            <textarea
              rows={3}
              value={checklistText}
              onChange={(e) => setChecklistText(e.target.value)}
              placeholder="第1章のテキストを読む&#10;練習問題を解く&#10;付箋を貼る"
              className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Question & Recovery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                自分への確認クエスチョン
              </label>
              <input
                type="text"
                value={checkQuestion}
                onChange={(e) => setCheckQuestion(e.target.value)}
                placeholder="例: 基本用語に迷いがなくなっているか？"
                className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                もし遅れていた場合のリカバリー策
              </label>
              <input
                type="text"
                value={recoveryTip}
                onChange={(e) => setRecoveryTip(e.target.value)}
                placeholder="例: 章末問題のみに絞って先に進む"
                className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Is buffer checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="is-buffer-checkbox"
              type="checkbox"
              checked={isBufferStage}
              onChange={(e) => setIsBufferStage(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
            <label
              htmlFor="is-buffer-checkbox"
              className="text-xs font-medium text-stone-700 cursor-pointer"
            >
              この目標を「予備日・バッファ・総復習ステージ」として扱う
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
