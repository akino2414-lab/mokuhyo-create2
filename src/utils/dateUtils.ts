import { GoalPlan } from '../types';

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(startDateStr: string, days: number): string {
  const [y, m, d] = startDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  // Day 1 is the start date, so Day X is startDate + (days - 1)
  date.setDate(date.getDate() + Math.max(0, days - 1));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
}

export function formatJapaneseDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeek = weekdays[date.getDay()];
  return `${m}月${d}日(${dayOfWeek})`;
}

export function calculateCurrentDayProgress(startDateStr: string, totalDays: number): {
  currentDay: number;
  percentage: number;
  isBeforeStart: boolean;
  isPastEnd: boolean;
  daysRemaining: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = startDateStr.split('-').map(Number);
  const startDate = new Date(y, m - 1, d);
  startDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const currentDay = diffDays + 1; // Day 1 = start day
  const isBeforeStart = currentDay < 1;
  const isPastEnd = currentDay > totalDays;
  const boundedDay = Math.min(Math.max(1, currentDay), totalDays);
  const percentage = Math.min(100, Math.max(0, Math.round((boundedDay / totalDays) * 100)));
  const daysRemaining = Math.max(0, totalDays - boundedDay);

  return {
    currentDay: boundedDay,
    percentage,
    isBeforeStart,
    isPastEnd,
    daysRemaining,
  };
}

export function exportPlanAsMarkdown(plan: GoalPlan): string {
  let md = `# 🎯 目標計画: ${plan.title}\n\n`;
  md += `- **期間**: ${plan.totalDays}日間 (${formatJapaneseDate(plan.startDate)} 〜 ${formatJapaneseDate(addDaysToDate(plan.startDate, plan.totalDays))})\n`;
  md += `- **1日の目安**: ${plan.dailyTime}\n`;
  md += `- **ペース方針**: ${plan.pacingAdvice}\n`;
  md += `- **毎日の推奨量**: ${plan.dailyRecommendedPace}\n\n`;
  md += `## 📋 全体の目安方針\n${plan.summary}\n\n`;
  md += `## 🚩 中間目標（マイルストーン）\n\n`;

  plan.milestones.forEach((m, idx) => {
    const targetDate = addDaysToDate(plan.startDate, m.day);
    const dateFormatted = formatJapaneseDate(targetDate);
    md += `### ${idx + 1}. 【Day ${m.day} / ${dateFormatted} まで】 ${m.title} (目安進捗: ${m.percentage}%)\n`;
    md += `> **大体この辺でここまでやっておくと良い目安:**\n> ${m.targetDescription}\n\n`;
    md += `**チェックリスト:**\n`;
    m.checklistItems.forEach((item) => {
      md += `- [${item.completed ? 'x' : ' '}] ${item.text}\n`;
    });
    md += `\n**自分への問いかけ:**\n*${m.checkQuestion}*\n\n`;
    md += `**もし遅れていたら？:**\n${m.recoveryTip}\n\n`;
    md += `---\n\n`;
  });

  return md;
}
