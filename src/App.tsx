import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GoalInputForm } from './components/GoalInputForm';
import { MilestoneTimeline } from './components/MilestoneTimeline';
import { MilestoneCard } from './components/MilestoneCard';
import { TodayWidget } from './components/TodayWidget';
import { PlanHeader } from './components/PlanHeader';
import { MilestoneModal } from './components/MilestoneModal';
import { PresetsModal } from './components/PresetsModal';
import { CalendarView } from './components/CalendarView';
import { DashboardMultiView } from './components/DashboardMultiView';
import { ViewModeTabs } from './components/ViewModeTabs';
import { CelebrationModal } from './components/CelebrationModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { GoalPlan, Milestone, PresetGoal, AppViewMode, GoalCategory } from './types';
import { getTodayString } from './utils/dateUtils';
import { Plus, Sparkles, ListChecks } from 'lucide-react';

const STORAGE_KEY = 'pacing_goal_plans_v1';

const DEFAULT_SAMPLE_PLAN: GoalPlan = {
  id: 'sample-study-plan',
  title: '30日で資格試験テキスト（全10章）を1周終わらせる',
  createdAt: new Date().toISOString(),
  startDate: getTodayString(),
  totalDays: 30,
  category: 'study',
  currentStatus: 'テキストは購入したがまだ1ページも開いていない',
  dailyTime: '平日45分、休日1.5時間',
  pacingStyle: 'front_loaded',
  summary:
    '「前半逃げ切り型」を採用し、最初の18日間で全体の約70%（第7章）まで進めて山場を越えます。後半は失速や急な用事を見越したバッファ期間と総復習に充てるため、三日坊主を防いで安心して完走できます。',
  pacingAdvice:
    '序盤は完璧に理解しようとせず、「まずは全体像を掴む60点主義」でページをめくりましょう。付箋だけ貼って先に進むのが最大のコツです。',
  dailyRecommendedPace:
    '平日：テキスト6〜8ページ通読 / 休日：章末問題と用語整理（約15ページ）',
  celebrationMessage:
    '30日間の学習プランを完走！テキスト1周をやり切った自信は本番への大きな武器になります。',
  milestones: [
    {
      id: 'm-1',
      day: 5,
      percentage: 20,
      title: '第1〜2章の通読 ＆ 全体像の把握',
      stageType: 'setup',
      targetDescription:
        'テキスト全体の目次を眺めて「どんな山があるか」を把握し、第2章までの基本用語に慣れておく。暗記は不要で「ふーん、こういう話か」と掴めればOK。',
      checklistItems: [
        { id: 'c-1-1', text: 'テキストの目次と全体の構成を5分でざっと眺める', completed: true },
        { id: 'c-1-2', text: '第1章を流し読みし、わからない単語にマーカーを引く', completed: true },
        { id: 'c-1-3', text: '第2章の概要を読み終え、毎日の学習時間を固定化する', completed: false },
      ],
      checkQuestion: '毎日「いつ・どこでテキストを開くか」の時間が決まりましたか？',
      recoveryTip:
        'もし第1章で止まっていても問題ありません。まずは「目次だけ読む」「1ページだけめくる」からハードルを下げましょう。',
      status: 'in_progress',
    },
    {
      id: 'm-2',
      day: 12,
      percentage: 50,
      title: '第3〜5章完了（前半の山場・折り返し地点）',
      stageType: 'practice',
      targetDescription:
        '最も重要でボリュームのある第3〜5章を通過する。練習問題は解けなくても解答をすぐ見て「解き方の流れ」を理解していれば充分合格ラインです。',
      checklistItems: [
        { id: 'c-2-1', text: '第3章・4章の重要テーマを流し読み', completed: false },
        { id: 'c-2-2', text: '第5章まで読み終え、全体の半分を通過する', completed: false },
        { id: 'c-2-3', text: 'どうしても理解できない箇所に付箋を貼って一旦保留にする', completed: false },
      ],
      checkQuestion: 'わからない箇所で立ち止まりすぎず、前に進めていますか？',
      recoveryTip:
        '理解に時間がかかる項目は深追い厳禁です。付箋を貼って飛ばし、後半の復習日に回しましょう。',
      status: 'not_started',
    },
    {
      id: 'm-3',
      day: 20,
      percentage: 80,
      title: '第6〜9章読破 ＆ メインパート完了',
      stageType: 'refine',
      targetDescription:
        '全体の約8割を終了！後半の応用パートを粗削りでも一通り目を通し終えている状態。これで「ゴールが見えた！」という心理的余裕が生まれます。',
      checklistItems: [
        { id: 'c-3-1', text: '第6〜8章の読破', completed: false },
        { id: 'c-3-2', text: '第9章の要点確認', completed: false },
        { id: 'c-3-3', text: '残りの第10章と復習箇所の洗い出し', completed: false },
      ],
      checkQuestion: '全体の終わりが見えてきて、達成感を感じられていますか？',
      recoveryTip:
        'もし遅れていたら、章末のまとめページと太字部分だけを優先して拾い読みしましょう。',
      status: 'not_started',
    },
    {
      id: 'm-4',
      day: 26,
      percentage: 95,
      title: '安全バッファ期間 ＆ 第10章＋弱点付箋の消化',
      stageType: 'buffer',
      targetDescription:
        'これまでの遅れを取り戻すための専用予備期間。急な残業や体調不良があってもここで吸収可能。最終章の確認と付箋を貼った箇所の見直しを行います。',
      checklistItems: [
        { id: 'c-4-1', text: '予備日を活用して、未消化だった章や問題を追いつかせる', completed: false },
        { id: 'c-4-2', text: '第10章を仕上げてテキスト全章読破を達成', completed: false },
        { id: 'c-4-3', text: '付箋を貼った苦手箇所をもう一度軽く見直す', completed: false },
      ],
      checkQuestion: '焦りや不安なく、残りの数日を迎えられていますか？',
      recoveryTip:
        'このバッファ期間があるからこそ遅延は怖くありません。落ち着いて1つずつ消化してください。',
      isBufferStage: true,
      status: 'not_started',
    },
    {
      id: 'm-5',
      day: 30,
      percentage: 100,
      title: 'テキスト1周完走 ＆ 総仕上げ！',
      stageType: 'finish',
      targetDescription:
        '全10章を完走！テキストを最初から最後までやり遂げた達成感を味わい、次の過去問演習や試験本番に向けた準備を整えるゴール地点です。',
      checklistItems: [
        { id: 'c-5-1', text: 'テキスト全体の読了完了を確認', completed: false },
        { id: 'c-5-2', text: '30日間継続できた自分をしっかり労う', completed: false },
        { id: 'c-5-3', text: '次のステップ（過去問など）の計画を簡単にメモ', completed: false },
      ],
      checkQuestion: '最初に立てた「30日で1周」をやり切ることができましたか？',
      recoveryTip:
        'たとえ何問か未解決の疑問があっても、テキストを最後まで通したこと自体が合格への最大のステップです！',
      status: 'not_started',
    },
  ],
};

export default function App() {
  const [savedPlans, setSavedPlans] = useState<GoalPlan[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved plans:', e);
    }
    return [DEFAULT_SAMPLE_PLAN];
  });

  const [activePlanId, setActivePlanId] = useState<string | null>(() => {
    return savedPlans.length > 0 ? savedPlans[0].id : null;
  });

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<AppViewMode>('plan');
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneToEdit, setMilestoneToEdit] = useState<Milestone | null>(null);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [celebrationState, setCelebrationState] = useState<{
    isOpen: boolean;
    plan: GoalPlan;
    completedMilestone?: Milestone | null;
    isEntireGoalCompleted?: boolean;
  } | null>(null);

  // Plan deletion state (for custom in-app confirmation modal)
  const [planToDelete, setPlanToDelete] = useState<GoalPlan | null>(null);
  const [milestoneToDelete, setMilestoneToDelete] = useState<Milestone | null>(null);

  // Save to localStorage whenever plans change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlans));
    } catch (e) {
      console.error('Failed to save plans to localStorage:', e);
    }
  }, [savedPlans]);

  const activePlan = savedPlans.find((p) => p.id === activePlanId) || savedPlans[0];

  // Handler to generate a new breakdown from form
  const handleGeneratePlan = async (formData: {
    goal: string;
    totalDays: number;
    startDate: string;
    category?: GoalCategory;
    currentStatus: string;
    dailyTime: string;
    pacingStyle: any;
    customNotes: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const json = await res.json();
      const generated = json.data;

      // Transform milestones into full Milestone model with ids & checklist items
      const milestones: Milestone[] = (generated.milestones || []).map(
        (m: any, idx: number) => ({
          id: `m-${Date.now()}-${idx}`,
          day: m.day,
          percentage: m.percentage || Math.round(((idx + 1) / generated.milestones.length) * 100),
          title: m.title,
          targetDescription: m.targetDescription,
          stageType: m.stageType,
          checklistItems: (m.checklistItems || []).map((text: string, cIdx: number) => ({
            id: `chk-${Date.now()}-${idx}-${cIdx}`,
            text,
            completed: false,
          })),
          checkQuestion: m.checkQuestion || 'ここまで予定通り進められていますか？',
          recoveryTip: m.recoveryTip || '少し遅れていても、重要度の高いものに絞って進めましょう。',
          isBufferStage: !!m.isBufferStage,
          status: idx === 0 ? 'in_progress' : 'not_started',
        })
      );

      const newPlan: GoalPlan = {
        id: `plan-${Date.now()}`,
        title: formData.goal,
        createdAt: new Date().toISOString(),
        startDate: formData.startDate,
        totalDays: formData.totalDays,
        category: formData.category || 'general',
        currentStatus: formData.currentStatus,
        dailyTime: formData.dailyTime,
        pacingStyle: formData.pacingStyle,
        customNotes: formData.customNotes,
        summary: generated.summary || `${formData.goal}を${formData.totalDays}日間で達成するためのロードマップです。`,
        pacingAdvice: generated.pacingAdvice || '無理のないペースで着実に進めましょう。',
        dailyRecommendedPace: generated.dailyRecommendedPace || `1日あたり全体の約${Math.max(1, Math.round(100 / formData.totalDays))}%を目安に進行`,
        celebrationMessage: generated.celebrationMessage,
        milestones,
      };

      setSavedPlans((prev) => [newPlan, ...prev]);
      setActivePlanId(newPlan.id);
      setIsCreatingNew(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Generation error, using fallback:', err);
      // Generate client-side fallback if fetch fails
      const fallbackMilestones: Milestone[] = [
        {
          id: `m-${Date.now()}-1`,
          day: Math.max(1, Math.round(formData.totalDays * 0.2)),
          percentage: 25,
          title: '初動の立ち上げ＆基礎固め',
          stageType: 'setup',
          targetDescription: `全体の概要や目次を確認し、必要な教材・ツールの準備を完了する。「${formData.goal}」の最初の1/4に着手する。`,
          checklistItems: [
            { id: `c-${Date.now()}-1`, text: '必要な準備と道具を揃える', completed: false },
            { id: `c-${Date.now()}-2`, text: '最初のハードルが低い部分を完了する', completed: false },
          ],
          checkQuestion: '日々の作業にとりかかる習慣ができていますか？',
          recoveryTip: 'まずは5分だけ触ることから始めましょう。',
          status: 'in_progress',
        },
        {
          id: `m-${Date.now()}-2`,
          day: Math.max(2, Math.round(formData.totalDays * 0.5)),
          percentage: 50,
          title: '折り返し地点（コア部分の完成）',
          stageType: 'practice',
          targetDescription: '作業の山場となる中核部分を進め、全体の半分を通過する。細かい完成度より前に進むことを優先。',
          checklistItems: [
            { id: `c-${Date.now()}-3`, text: '主要タスクの半分を消化', completed: false },
            { id: `c-${Date.now()}-4`, text: '不明点や課題を一旦メモして保留にする', completed: false },
          ],
          checkQuestion: 'ペースが落ちずに維持できていますか？',
          recoveryTip: '完璧主義を捨てて60点の仕上がりで先に進みましょう。',
          status: 'not_started',
        },
        {
          id: `m-${Date.now()}-3`,
          day: Math.max(3, Math.round(formData.totalDays * 0.85)),
          percentage: 85,
          title: '全体の8割完成＆バッファ調整',
          stageType: 'buffer',
          targetDescription: '大部分の主要作業を終え、遅れを取り戻すための予備期間を確保しながら最終仕上げを行う。',
          checklistItems: [
            { id: `c-${Date.now()}-5`, text: '残った課題の絞り込み', completed: false },
            { id: `c-${Date.now()}-6`, text: 'バッファ日を活用して遅れを吸収', completed: false },
          ],
          checkQuestion: '心に余裕を持ってラストスパートに入れそうですか？',
          recoveryTip: '必須項目だけに絞れば確実に間に合います。',
          isBufferStage: true,
          status: 'not_started',
        },
        {
          id: `m-${Date.now()}-4`,
          day: formData.totalDays,
          percentage: 100,
          title: '目標達成＆フィニッシュ！',
          stageType: 'finish',
          targetDescription: `「${formData.goal}」の完了！成果を振り返り、これまでの努力を讃えましょう。`,
          checklistItems: [
            { id: `c-${Date.now()}-7`, text: '最終完了の確認', completed: false },
            { id: `c-${Date.now()}-8`, text: '達成の振り返りと次の目標決め', completed: false },
          ],
          checkQuestion: '最初に目指したゴールを形にできましたか？',
          recoveryTip: 'ここまで進んだこと自体が大きな成果です！',
          status: 'not_started',
        },
      ];

      const fallbackPlan: GoalPlan = {
        id: `plan-${Date.now()}`,
        title: formData.goal,
        createdAt: new Date().toISOString(),
        startDate: formData.startDate,
        totalDays: formData.totalDays,
        category: formData.category || 'general',
        currentStatus: formData.currentStatus,
        dailyTime: formData.dailyTime,
        pacingStyle: formData.pacingStyle,
        summary: `「${formData.goal}」を${formData.totalDays}日間で無理なく達成するためのロードマップです。`,
        pacingAdvice: '無理のない均等なリズムで少しずつ前進しましょう。',
        dailyRecommendedPace: `1日あたり全体の約${Math.max(1, Math.round(100 / formData.totalDays))}%を消化`,
        milestones: fallbackMilestones,
      };

      setSavedPlans((prev) => [fallbackPlan, ...prev]);
      setActivePlanId(fallbackPlan.id);
      setIsCreatingNew(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Milestone actions
  const handleToggleChecklistItem = (milestoneId: string, itemId: string) => {
    if (!activePlan) return;
    let newlyCompletedMilestone: Milestone | null = null;

    const updatedMilestones = activePlan.milestones.map((m) => {
      if (m.id !== milestoneId) return m;
      const updatedChecklist = m.checklistItems.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      // Auto-update status if all items checked
      const allChecked = updatedChecklist.length > 0 && updatedChecklist.every((c) => c.completed);
      const newStatus = allChecked ? ('completed' as const) : m.status === 'completed' ? ('in_progress' as const) : m.status;

      if (allChecked && m.status !== 'completed') {
        newlyCompletedMilestone = { ...m, status: 'completed', checklistItems: updatedChecklist };
      }

      return {
        ...m,
        checklistItems: updatedChecklist,
        status: newStatus,
        completedAt: newStatus === 'completed' ? m.completedAt || new Date().toISOString() : undefined,
      };
    });

    updateActivePlanMilestones(updatedMilestones);

    // If milestone was newly completed, trigger praise celebration!
    if (newlyCompletedMilestone) {
      const willAllBeCompleted = updatedMilestones.every((m) => m.status === 'completed');
      setCelebrationState({
        isOpen: true,
        plan: { ...activePlan, milestones: updatedMilestones },
        completedMilestone: newlyCompletedMilestone,
        isEntireGoalCompleted: willAllBeCompleted,
      });
    }
  };

  const handleAddChecklistItem = (milestoneId: string, text: string) => {
    if (!activePlan) return;
    const updatedMilestones = activePlan.milestones.map((m) => {
      if (m.id !== milestoneId) return m;
      return {
        ...m,
        checklistItems: [
          ...m.checklistItems,
          { id: `chk-${Date.now()}`, text, completed: false },
        ],
      };
    });
    updateActivePlanMilestones(updatedMilestones);
  };

  const handleUpdateStatus = (milestoneId: string, status: Milestone['status']) => {
    if (!activePlan) return;
    const target = activePlan.milestones.find((m) => m.id === milestoneId);
    const wasNotCompleted = target && target.status !== 'completed';

    const updatedMilestones = activePlan.milestones.map((m) => {
      if (m.id !== milestoneId) return m;
      // If marking completed, also check all checklist items
      const updatedChecklist =
        status === 'completed'
          ? m.checklistItems.map((c) => ({ ...c, completed: true }))
          : m.checklistItems;
      return {
        ...m,
        status,
        checklistItems: updatedChecklist,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      };
    });

    updateActivePlanMilestones(updatedMilestones);

    // If newly marked completed, show celebration & praise!
    if (status === 'completed' && wasNotCompleted && target) {
      const willAllBeCompleted = updatedMilestones.every((m) => m.status === 'completed');
      setCelebrationState({
        isOpen: true,
        plan: { ...activePlan, milestones: updatedMilestones },
        completedMilestone: target,
        isEntireGoalCompleted: willAllBeCompleted,
      });
    }
  };

  const handleTriggerMilestonePraise = (milestone: Milestone) => {
    if (!activePlan) return;
    setCelebrationState({
      isOpen: true,
      plan: activePlan,
      completedMilestone: milestone,
      isEntireGoalCompleted: false,
    });
  };

  const handleTriggerGoalPraise = (planToCelebrate?: GoalPlan) => {
    const target = planToCelebrate || activePlan;
    if (!target) return;
    setCelebrationState({
      isOpen: true,
      plan: target,
      completedMilestone: null,
      isEntireGoalCompleted: true,
    });
  };

  const handleUpdateNotes = (milestoneId: string, notes: string) => {
    if (!activePlan) return;
    const updatedMilestones = activePlan.milestones.map((m) =>
      m.id === milestoneId ? { ...m, userNotes: notes } : m
    );
    updateActivePlanMilestones(updatedMilestones);
  };

  const handleRequestDeleteMilestone = (milestoneId: string) => {
    if (!activePlan) return;
    const target = activePlan.milestones.find((m) => m.id === milestoneId);
    if (!target) return;
    setMilestoneToDelete(target);
  };

  const handleConfirmDeleteMilestone = () => {
    if (!activePlan || !milestoneToDelete) return;
    const updatedMilestones = activePlan.milestones.filter(
      (m) => m.id !== milestoneToDelete.id
    );
    updateActivePlanMilestones(updatedMilestones);
    setMilestoneToDelete(null);
  };

  const handleSaveMilestoneModal = (data: Partial<Milestone>) => {
    if (!activePlan) return;
    let updatedMilestones: Milestone[];

    if (milestoneToEdit) {
      // Edit existing
      updatedMilestones = activePlan.milestones.map((m) =>
        m.id === milestoneToEdit.id ? ({ ...m, ...data } as Milestone) : m
      );
    } else {
      // Add new milestone
      const newMilestone: Milestone = {
        id: `m-${Date.now()}`,
        day: data.day || 7,
        percentage: data.percentage || 50,
        title: data.title || '新しい中間目標',
        targetDescription: data.targetDescription || '',
        checklistItems: data.checklistItems || [],
        checkQuestion: data.checkQuestion || 'ここまで進められていますか？',
        recoveryTip: data.recoveryTip || '焦らず優先タスクを進めましょう。',
        isBufferStage: !!data.isBufferStage,
        status: 'not_started',
      };
      updatedMilestones = [...activePlan.milestones, newMilestone];
    }

    // Sort milestones chronologically by day
    updatedMilestones.sort((a, b) => a.day - b.day);
    updateActivePlanMilestones(updatedMilestones);
  };

  const updateActivePlanMilestones = (updatedMilestones: Milestone[]) => {
    if (!activePlan) return;
    const updatedPlan: GoalPlan = {
      ...activePlan,
      milestones: updatedMilestones,
    };
    setSavedPlans((prev) =>
      prev.map((p) => (p.id === activePlan.id ? updatedPlan : p))
    );
  };

  const handleRequestDeletePlan = (planId?: string) => {
    const target = planId
      ? savedPlans.find((p) => p.id === planId)
      : activePlan;
    if (!target) return;
    setPlanToDelete(target);
  };

  const handleConfirmDeletePlan = () => {
    if (!planToDelete) return;
    const deletedId = planToDelete.id;
    const filtered = savedPlans.filter((p) => p.id !== deletedId);
    setSavedPlans(filtered);
    setPlanToDelete(null);

    if (activePlanId === deletedId) {
      if (filtered.length > 0) {
        setActivePlanId(filtered[0].id);
      } else {
        setActivePlanId(null);
        setIsCreatingNew(true);
      }
    }
  };

  const handleFocusMilestone = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    const elem = document.getElementById(`milestone-${milestoneId}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col antialiased">
      {/* App Header */}
      <Header
        onNewGoal={() => setIsCreatingNew(true)}
        onOpenPresets={() => setIsPresetsModalOpen(true)}
        savedPlans={savedPlans}
        activePlanId={activePlanId}
        onSelectPlan={(id) => {
          setActivePlanId(id);
          setIsCreatingNew(false);
          setViewMode('plan');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* If creating new goal OR no active plan exists, show the Form */}
        {isCreatingNew || !activePlan ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (savedPlans.length > 0) setIsCreatingNew(false);
                }}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition cursor-pointer flex items-center gap-1"
              >
                {savedPlans.length > 0 && <span>← 計画中の目標一覧に戻る</span>}
              </button>

              <button
                type="button"
                onClick={() => setIsPresetsModalOpen(true)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>例文・テンプレートから選ぶ</span>
              </button>
            </div>

            <GoalInputForm
              onSubmit={handleGeneratePlan}
              isLoading={isLoading}
            />
          </div>
        ) : (
          /* View Mode Container */
          <div className="space-y-5">
            {/* View Mode Switching Tabs (目標プラン / カレンダー / 複数目標ダッシュボード) */}
            <ViewModeTabs
              currentView={viewMode}
              onViewChange={setViewMode}
              savedPlansCount={savedPlans.length}
            />

            {viewMode === 'dashboard' ? (
              /* Multi-Goal Dashboard View */
              <DashboardMultiView
                savedPlans={savedPlans}
                activePlanId={activePlanId}
                onSelectPlan={(id) => {
                  setActivePlanId(id);
                  setViewMode('plan');
                }}
                onNewGoal={() => setIsCreatingNew(true)}
                onOpenPresets={() => setIsPresetsModalOpen(true)}
                onCelebrateGoal={(planToCelebrate) => handleTriggerGoalPraise(planToCelebrate)}
                onDeletePlan={(id) => handleRequestDeletePlan(id)}
              />
            ) : viewMode === 'calendar' ? (
              /* Calendar Format View */
              <CalendarView
                savedPlans={savedPlans}
                activePlanId={activePlanId}
                onSelectPlan={(id) => setActivePlanId(id)}
                onSelectMilestone={(mId) => {
                  setViewMode('plan');
                  handleFocusMilestone(mId);
                }}
              />
            ) : (
              /* Standard Goal Plan Base View */
              <div className="space-y-6">
                {/* Plan Header */}
                <PlanHeader
                  plan={activePlan}
                  onAddMilestone={() => {
                    setMilestoneToEdit(null);
                    setIsMilestoneModalOpen(true);
                  }}
                  onDeletePlan={() => handleRequestDeletePlan()}
                  onNewGoal={() => setIsCreatingNew(true)}
                  onReBreakdown={() => setIsCreatingNew(true)}
                  onCelebrate={() => handleTriggerGoalPraise(activePlan)}
                />

                {/* Today's Benchmark Widget */}
                <TodayWidget
                  plan={activePlan}
                  onFocusMilestone={handleFocusMilestone}
                />

                {/* Visual Timeline Bar */}
                <MilestoneTimeline
                  plan={activePlan}
                  onSelectMilestone={handleFocusMilestone}
                  selectedMilestoneId={selectedMilestoneId}
                />

                {/* Intermediate Milestones Cards List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-bold text-stone-900 tracking-tight">
                        中間チェックポイント一覧（全 {activePlan.milestones.length} 段階）
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMilestoneToEdit(null);
                        setIsMilestoneModalOpen(true);
                      }}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>中間目標を追加</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activePlan.milestones.map((milestone, idx) => (
                      <MilestoneCard
                        key={milestone.id}
                        milestone={milestone}
                        index={idx}
                        plan={activePlan}
                        currentDay={
                          Math.max(
                            1,
                            Math.min(
                              activePlan.totalDays,
                              Math.floor(
                                (new Date().getTime() -
                                  new Date(activePlan.startDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              ) + 1
                            )
                          )
                        }
                        onToggleChecklistItem={handleToggleChecklistItem}
                        onAddChecklistItem={handleAddChecklistItem}
                        onUpdateStatus={handleUpdateStatus}
                        onUpdateNotes={handleUpdateNotes}
                        onEditMilestone={(m) => {
                          setMilestoneToEdit(m);
                          setIsMilestoneModalOpen(true);
                        }}
                        onDeleteMilestone={handleRequestDeleteMilestone}
                        onCelebrate={handleTriggerMilestonePraise}
                        isSelected={selectedMilestoneId === milestone.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white/60 py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>中間目標プランナー — 漠然とした目標を、安心できる中間目安へ</span>
          <span className="text-stone-400">
            ペース配分設計 ＆ バッファ確保で挫折を防ぐ
          </span>
        </div>
      </footer>

      {/* Celebration & Praise Modal */}
      {celebrationState && (
        <CelebrationModal
          isOpen={celebrationState.isOpen}
          onClose={() => setCelebrationState(null)}
          plan={celebrationState.plan}
          completedMilestone={celebrationState.completedMilestone}
          isEntireGoalCompleted={celebrationState.isEntireGoalCompleted}
        />
      )}

      {/* Modals */}
      {activePlan && (
        <MilestoneModal
          isOpen={isMilestoneModalOpen}
          onClose={() => setIsMilestoneModalOpen(false)}
          milestoneToEdit={milestoneToEdit}
          onSave={handleSaveMilestoneModal}
          plan={activePlan}
        />
      )}

      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectPreset={(preset) => {
          handleGeneratePlan({
            goal: preset.title,
            totalDays: preset.days,
            startDate: getTodayString(),
            category: preset.goalCategory || 'general',
            currentStatus: preset.status,
            dailyTime: preset.dailyTime,
            pacingStyle: preset.pacingStyle,
            customNotes: '',
          });
        }}
      />

      {/* Delete Confirmation Modal for Plan */}
      {planToDelete && (
        <DeleteConfirmModal
          isOpen={!!planToDelete}
          onClose={() => setPlanToDelete(null)}
          onConfirm={handleConfirmDeletePlan}
          title="この目標計画を削除しますか？"
          description={`「${planToDelete.title}」および設定されたすべての中間チェックポイントと記録が削除されます。この操作は元に戻せません。`}
          confirmLabel="計画を削除する"
        />
      )}

      {/* Delete Confirmation Modal for Milestone */}
      {milestoneToDelete && (
        <DeleteConfirmModal
          isOpen={!!milestoneToDelete}
          onClose={() => setMilestoneToDelete(null)}
          onConfirm={handleConfirmDeleteMilestone}
          title="この中間目標を削除しますか？"
          description={`Day ${milestoneToDelete.day} の「${milestoneToDelete.title}」を削除します。この操作は元に戻せません。`}
          confirmLabel="中間目標を削除"
        />
      )}
    </div>
  );
}
