import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Zap,
  ShieldCheck,
  TrendingUp,
  Compass,
  ArrowRight,
  HelpCircle,
  Loader2,
  BookOpen,
  Laptop,
  Activity,
  Home,
  Layers,
} from 'lucide-react';
import { PacingStyle, GoalCategory } from '../types';
import { getTodayString } from '../utils/dateUtils';

interface GoalInputFormProps {
  onSubmit: (formData: {
    goal: string;
    totalDays: number;
    startDate: string;
    category: GoalCategory;
    currentStatus: string;
    dailyTime: string;
    pacingStyle: PacingStyle;
    customNotes: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const CATEGORY_OPTIONS: {
  id: GoalCategory;
  label: string;
  sub: string;
  icon: any;
}[] = [
  {
    id: 'study',
    label: '勉強・資格・読書',
    sub: '章ごとの進捗・過去問・暗記定着',
    icon: BookOpen,
  },
  {
    id: 'project',
    label: '制作・開発・仕事',
    sub: 'プロトタイプ・コア機能・公開',
    icon: Laptop,
  },
  {
    id: 'habit',
    label: '習慣・運動・健康',
    sub: '最小ハードル・日課定着・休息調整',
    icon: Activity,
  },
  {
    id: 'life',
    label: '生活・片付け・整理',
    sub: 'エリア別仕分け・不用品処分・新定置',
    icon: Home,
  },
  {
    id: 'general',
    label: 'その他・自由目標',
    sub: '目標文脈に沿って柔軟に設計',
    icon: Layers,
  },
];

const PACING_OPTIONS: {
  id: PacingStyle;
  label: string;
  badge: string;
  description: string;
  icon: any;
}[] = [
  {
    id: 'front_loaded',
    label: '前半逃げ切り型',
    badge: '挫折防止に一番おすすめ！',
    description: '期間の前半60%で大枠を終わらせ、後半はバッファ・復習・ブラッシュアップに充てて余裕を作ります。',
    icon: Zap,
  },
  {
    id: 'buffer_first',
    label: '安全バッファ重視型',
    badge: '多忙な人に最適',
    description: '最終盤の20〜25%を完全な「予備日・調整日」として確保し、急な予定や遅延を確実に吸収します。',
    icon: ShieldCheck,
  },
  {
    id: 'steady',
    label: '均等ペース型',
    badge: 'ルーティン化',
    description: '全期間を通して波を作らず、毎日均等な量をコツコツ積み上げるスタンダードな配分です。',
    icon: Compass,
  },
  {
    id: 'ramp_up',
    label: 'スロースタート型',
    badge: '三日坊主を防ぐ',
    description: '最初は「5分触るだけ」など極小のハードルから始め、習慣が定着した中盤以降に加速します。',
    icon: TrendingUp,
  },
];

const SUGGESTIONS_BY_CATEGORY: Record<GoalCategory, string[]> = {
  study: [
    '30日で資格試験テキスト（全10章）を1周終わらせる',
    '10日で積ん読本3冊を読破してメモをまとめる',
    '60日でTOEIC単語帳1000語と公式問題集2回分を解く',
  ],
  project: [
    '14日でポートフォリオWebサイトを公開する',
    '21日でYouTube動画を3本編集して投稿する',
    '30日で個人開発のWebアプリMVPをリリースする',
  ],
  habit: [
    '30日で体重マイナス2kg＆軽い筋トレ習慣をつける',
    '21日で朝6時起きのルーティンを定着させる',
    '14日で毎日15分のストレッチ・ウォーキングを継続する',
  ],
  life: [
    '21日で部屋全体の断捨離＆片付けを完了する',
    '14日で押し入れ・クローゼットを整理して不用品を売る',
    '7日でキッチンの棚と冷蔵庫の中を総点検・清掃する',
  ],
  general: [
    '30日でやりたいことリスト10個を実行する',
    '14日で新しい趣味の基礎を体験してまとめる',
  ],
};

export const GoalInputForm: React.FC<GoalInputFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [goal, setGoal] = useState('');
  const [totalDays, setTotalDays] = useState(30);
  const [startDate, setStartDate] = useState(getTodayString());
  const [category, setCategory] = useState<GoalCategory>('study');
  const [currentStatus, setCurrentStatus] = useState('未着手（ゼロからスタート）');
  const [dailyTime, setDailyTime] = useState('平日30〜45分、休日1〜2時間');
  const [pacingStyle, setPacingStyle] = useState<PacingStyle>('front_loaded');
  const [customNotes, setCustomNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    onSubmit({
      goal: goal.trim(),
      totalDays: Number(totalDays),
      startDate,
      category,
      currentStatus,
      dailyTime,
      pacingStyle,
      customNotes,
    });
  };

  const handleQuickDays = (days: number) => {
    setTotalDays(days);
  };

  const currentSuggestions = SUGGESTIONS_BY_CATEGORY[category] || SUGGESTIONS_BY_CATEGORY.study;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 sm:p-7 transition">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            目標と期間を入力
          </h2>
        </div>
        <p className="text-sm text-stone-600">
          「何日でここまでやりたいか」を教えてください。目標の種類や性質に合わせた最適チェックポイントを設計します。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal Category Selector */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            目標のジャンル・性質（チェックポイントの内容が変わります）
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500 text-stone-900'
                      : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? 'text-amber-600' : 'text-stone-400'
                      }`}
                    />
                    <span className="text-xs font-bold truncate">{cat.label}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 leading-tight line-clamp-1">
                    {cat.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Goal Input */}
        <div>
          <label
            htmlFor="goal-input"
            className="block text-sm font-semibold text-stone-800 mb-1.5"
          >
            やりたい目標（漠然としていてもOK） <span className="text-amber-600">*</span>
          </label>
          <input
            id="goal-input"
            type="text"
            required
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder={
              category === 'study'
                ? '例: 簿記3級のテキストを1周終わらせる、TOEIC単語帳を暗記する'
                : category === 'project'
                ? '例: ポートフォリオWebサイトを公開する、YouTube動画を3本投稿する'
                : category === 'habit'
                ? '例: 体重マイナス2kg＆筋トレ習慣化、毎日早起きして散歩する'
                : category === 'life'
                ? '例: 21日で部屋の断捨離＆片付けを完了する、服のメルカリ出品'
                : '例: 30日で新しいスキルを身につけて形にする'
            }
            className="w-full px-4 py-3 text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition"
          />

          {/* Quick Suggestion Chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="text-xs text-stone-400 self-center mr-1">おすすめ例:</span>
            {currentSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setGoal(item)}
                className="text-xs bg-stone-100 hover:bg-stone-200/80 text-stone-600 px-2.5 py-1 rounded-md transition cursor-pointer text-left"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Days and Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Days */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="days-input"
                className="text-sm font-semibold text-stone-800 flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-amber-600" />
                期間（何日間でやりたいか）
              </label>
              <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                {totalDays} 日間
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="days-range"
                type="range"
                min={3}
                max={120}
                step={1}
                value={totalDays}
                onChange={(e) => setTotalDays(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
              />
              <input
                id="days-input"
                type="number"
                min={1}
                max={365}
                value={totalDays}
                onChange={(e) => setTotalDays(Math.max(1, Number(e.target.value)))}
                className="w-20 px-2.5 py-1.5 text-center text-sm font-bold text-stone-800 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quick Days selector */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[7, 14, 21, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleQuickDays(d)}
                  className={`text-xs px-2.5 py-0.5 rounded-full border transition cursor-pointer font-medium ${
                    totalDays === d
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {d}日間
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="start-date-input"
              className="block text-sm font-semibold text-stone-800 mb-1.5"
            >
              開始日（いつからスタート？）
            </label>
            <input
              id="start-date-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-stone-800 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition"
            />
            <p className="text-xs text-stone-500 mt-1">
              ※ 本日（{startDate}）を開始日として計算します
            </p>
          </div>
        </div>

        {/* Pacing Style Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-stone-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              ペース配分のタイプ（どう進めたい？）
            </label>
            <span className="text-xs text-stone-500">
              進め方に合わせて中間目標の間隔と負荷を調整します
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PACING_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = pacingStyle === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setPacingStyle(opt.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-amber-500 text-white'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-stone-900">
                          {opt.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed mt-1.5">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="border-t border-stone-100 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 transition cursor-pointer"
          >
            <span>{showAdvanced ? '▲ 詳細条件を閉じる' : '▼ 現在の状況や日々の目安時間を詳しく指定する（任意）'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  現在のスタート地点（今の状況）
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="未着手（ゼロからスタート）">未着手（ゼロからスタート）</option>
                  <option value="道具や教材だけ用意した状態">道具や教材だけ用意した状態</option>
                  <option value="少しだけ手をつけて途中で止まっている">少しだけ手をつけて途中で止まっている</option>
                  <option value="基礎知識は少しある状態">基礎知識は少しある状態</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  1日に割ける作業・学習の目安時間
                </label>
                <input
                  type="text"
                  value={dailyTime}
                  onChange={(e) => setDailyTime(e.target.value)}
                  placeholder="例: 平日30分、休日2時間"
                  className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  こだわり・留意したい点（任意）
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="例: 週末にまとめて進めたい、途中でやる気が落ちやすいので小さく刻みたい など"
                  className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            id="generate-milestones-btn"
            type="submit"
            disabled={isLoading || !goal.trim()}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition shadow-sm flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>「ここまでやっておくと良い目安」を計算・設計中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>大体この辺でここまでやっとく中間目標を建てる</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-stone-400 mt-2">
            AI分析 ＋ ペース配分アルゴリズムにより、無理なく続く中間目標を作成します
          </p>
        </div>
      </form>
    </div>
  );
};
