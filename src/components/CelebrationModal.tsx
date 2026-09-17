import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Milestone, GoalPlan } from '../types';
import { Sparkles, Trophy, CheckCircle2, Heart, Award, ArrowRight, X } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: GoalPlan;
  completedMilestone?: Milestone | null;
  isEntireGoalCompleted?: boolean;
}

const MILESTONE_PRAISE_MESSAGES = [
  '素晴らしい前進です！この中間チェックポイントを通過できたのは、毎日少しずつ積み重ねたあなたの努力の賜物です！',
  'お見事です！大きな目標も、こうして1歩ずつ確実に進めば必ず届きます。胸を張ってください！',
  'ナイス達成！「大体ここまで」を着実にやり切った自信は、次のステップへの大きな推進力になります！',
  '着実にゴールが近づいています！途中で立ち止まらずにここまで来られた自分を、ぜひ思いっきり褒めてあげてください！',
  'ペース配分バッチリです！一歩一歩前進しているあなたの継続力は本当に素晴らしいです！',
];

const GOAL_COMPLETED_PRAISES = [
  '全工程完走、本当におめでとうございます！🎉 初めは大きな山に見えた目標を、最後までやり切ったあなたの粘り強さと行動力に心から拍手を送ります！',
  '感動のゴール達成です！🎉 途中の困難や忙しさを乗り越えてここまで辿り着いた経験は、これからのあなたのかけがえのない自信になります！',
  '目標達成おめでとうございます！🎉 計画通りに、あるいは柔軟に軌道修正しながら完走できたあなたは本当にすごいです！今日は思い切り自分にご褒美をあげてください！',
];

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  plan,
  completedMilestone,
  isEntireGoalCompleted,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger festive confetti
      try {
        if (isEntireGoalCompleted) {
          // Bigger confetti burst for complete goal
          const count = 200;
          const defaults = {
            origin: { y: 0.7 },
            zIndex: 9999,
          };

          const fire = (particleRatio: number, opts: confetti.Options) => {
            confetti({
              ...defaults,
              ...opts,
              particleCount: Math.floor(count * particleRatio),
            });
          };

          fire(0.25, { spread: 26, startVelocity: 55 });
          fire(0.2, { spread: 60 });
          fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
          fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
          fire(0.1, { spread: 120, startVelocity: 45 });
        } else {
          // Cheerful moderate burst for single milestone
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 9999,
          });
        }
      } catch (e) {
        console.error('Confetti trigger error:', e);
      }
    }
  }, [isOpen, isEntireGoalCompleted]);

  if (!isOpen) return null;

  // Pick praise message based on milestone or goal completion
  const praiseText = isEntireGoalCompleted
    ? plan.celebrationMessage || GOAL_COMPLETED_PRAISES[Math.floor(Math.random() * GOAL_COMPLETED_PRAISES.length)]
    : MILESTONE_PRAISE_MESSAGES[Math.floor(Math.random() * MILESTONE_PRAISE_MESSAGES.length)];

  const completedCount = plan.milestones.filter((m) => m.status === 'completed').length;
  const totalCount = plan.milestones.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-200/80 relative text-center overflow-hidden">
        {/* Subtle Background Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition cursor-pointer"
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Badge Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/25 mb-4 animate-bounce">
          {isEntireGoalCompleted ? (
            <Trophy className="w-10 h-10 text-amber-50" />
          ) : (
            <Award className="w-10 h-10 text-amber-50" />
          )}
        </div>

        {/* Category Header */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700 mb-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{isEntireGoalCompleted ? '目標コンプリート！' : '中間目標 達成！'}</span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>

        {/* Main Title */}
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-2 leading-tight">
          {isEntireGoalCompleted
            ? '🎊 全工程やり切りました！ 🎊'
            : completedMilestone
            ? `「${completedMilestone.title}」クリア！`
            : '素晴らしい進捗です！'}
        </h2>

        {/* Target Goal Reference */}
        <div className="text-xs text-stone-500 font-medium mb-5 bg-stone-50 py-1.5 px-3 rounded-xl inline-block border border-stone-200/70 max-w-full truncate">
          🎯 {plan.title}
        </div>

        {/* Heartfelt Praise Card */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 text-left mb-5 space-y-2 relative">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
            <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>あなたへのメッセージ</span>
          </div>
          <p className="text-stone-800 text-sm leading-relaxed font-medium">
            {praiseText}
          </p>
        </div>

        {/* Progress summary block */}
        <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 flex items-center justify-around text-center mb-6">
          <div>
            <div className="text-[11px] text-stone-500">通過チェックポイント</div>
            <div className="text-base font-black text-amber-700">
              {completedCount} / {totalCount} 完了
            </div>
          </div>
          <div className="w-px h-8 bg-stone-200" />
          <div>
            <div className="text-[11px] text-stone-500">全体進捗率</div>
            <div className="text-base font-black text-stone-900">
              {Math.min(100, Math.round((completedCount / Math.max(1, totalCount)) * 100))}%
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg shadow-amber-600/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
        >
          <span>{isEntireGoalCompleted ? '達成感を味わって閉じる' : 'この調子で次へ進む！'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
