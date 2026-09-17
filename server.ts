import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Milestone generation endpoint
app.post('/api/breakdown', async (req, res) => {
  try {
    const {
      goal,
      totalDays,
      currentStatus = '未着手',
      dailyTime = '1日30分〜1時間程度',
      pacingStyle = 'front_loaded',
      customNotes = '',
    } = req.body;

    if (!goal || !totalDays || totalDays <= 0) {
      return res.status(400).json({ error: '目標と日数は必須です。' });
    }

    // Pacing style translation to prompt guidance
    const pacingDescriptions: Record<string, string> = {
      front_loaded:
        '「前半逃げ切り型」: 期間の前半60〜70%で大部分の作業や学習を終え、後半はゆとりや総復習、バッファに充てる配分。挫折防止に一番効果的。',
      steady:
        '「均等ペース型」: 全期間を通して無理なく均等に歩みを進める配分。',
      ramp_up:
        '「スロースタート型」: 序盤は習慣づけや環境構築に専念し、中盤から後半にかけて本格的な加速をする配分。',
      buffer_first:
        '「安全バッファ重視型」: 最終盤の20%〜25%の日数を完全に「予備日・調整日」として空けておき、トラブルや遅延を吸収できる配分。',
    };

    const pacingGuide =
      pacingDescriptions[pacingStyle] || pacingDescriptions.front_loaded;

    if (!ai) {
      return res.status(200).json({
        source: 'fallback',
        message: 'GEMINI_API_KEY未設定のため、内蔵の目標分解エンジンを使用します。',
        data: generateHeuristicBreakdown({
          goal,
          totalDays: Number(totalDays),
          currentStatus,
          dailyTime,
          pacingStyle,
          customNotes,
        }),
      });
    }

    const systemPrompt = `あなたは目標達成とプロジェクトペース配分の専門コーチです。
ユーザーは「◯日でここまでやりたい」という漠然とした目標を持っています。
これに対して、不安なく着実に進められるよう、「大体この辺でここまでやっておくと良い」という現実的で心理的負担の少ない中間目標（マイルストーン）を提案してください。

重要指針:
1. 3〜5個程度の中間マイルストーンを設定すること。
2. それぞれのマイルストーンで「何日目頃（Day X）にどこまで到達していれば合格か（理想の到達目安）」を具体的に言語化すること。
3. 「ここでのチェックポイント（自分への確認項目）」を入れること。
4. 万が一遅れた場合の「リカバリー策・焦らないための処方箋」を必ず提示すること。
5. 指定されたペース配分（${pacingGuide}）を反映させること。特に最終盤には予備日（バッファ）を設けること。
6. 返答は日本語で、ユーザーが「これならできそう！」と安心できる温かく前向きなトーンにすること。`;

    const prompt = `目標: "${goal}"
目標期間: ${totalDays}日間
現在の状況: ${currentStatus}
1日の作業/活動目安: ${dailyTime}
ペース配分タイプ: ${pacingStyle} (${pacingGuide})
補足・こだわり: ${customNotes || '特になし'}

上記を分析し、最適な中間目標計画をJSON形式で作成してください。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'この目標に対する全体のアプローチ方針と励ましの一言',
            },
            pacingAdvice: {
              type: Type.STRING,
              description: '全体のペース配分で意識すべき最大のコツ',
            },
            dailyRecommendedPace: {
              type: Type.STRING,
              description: '1日あたりの具体的な目安単位（例: 1日5ページ、1日30分の実装 など）',
            },
            milestones: {
              type: Type.ARRAY,
              description: '中間目標のリスト（3〜5個）',
              items: {
                type: Type.OBJECT,
                properties: {
                  day: {
                    type: Type.INTEGER,
                    description: '目標日数（開始日をDay 1としたときの目安の日目、例: 4, 10, 20）',
                  },
                  percentage: {
                    type: Type.INTEGER,
                    description: '全体の進捗目安パーセンテージ（例: 25, 50, 75, 100）',
                  },
                  title: {
                    type: Type.STRING,
                    description: 'この中間目標のタイトル（例: 準備＆第1章読破）',
                  },
                  targetDescription: {
                    type: Type.STRING,
                    description: '「この辺でここまでやっておくと良い」具体的な到達状態',
                  },
                  checklistItems: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'この段階での具体的なチェック項目（2〜3個）',
                  },
                  checkQuestion: {
                    type: Type.STRING,
                    description: '自分への確認クエスチョン（例: ここで基本用語に迷いがなくなっているか？）',
                  },
                  recoveryTip: {
                    type: Type.STRING,
                    description: 'もしこの時点で遅れていた場合の安心リカバリー策',
                  },
                  isBufferStage: {
                    type: Type.BOOLEAN,
                    description: '予備日・調整・総復習ステージかどうか',
                  },
                },
                required: [
                  'day',
                  'percentage',
                  'title',
                  'targetDescription',
                  'checklistItems',
                  'checkQuestion',
                  'recoveryTip',
                ],
              },
            },
            celebrationMessage: {
              type: Type.STRING,
              description: '目標達成時のイメージや祝福メッセージ',
            },
          },
          required: ['summary', 'pacingAdvice', 'dailyRecommendedPace', 'milestones'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI model');
    }

    const parsed = JSON.parse(text);
    return res.json({
      source: 'gemini',
      data: parsed,
    });
  } catch (error: any) {
    console.error('Breakdown generation error:', error);
    // Fallback to rule-based generation if AI fails
    const fallbackData = generateHeuristicBreakdown(req.body);
    return res.json({
      source: 'fallback',
      fallbackReason: error.message || 'AI generation failed',
      data: fallbackData,
    });
  }
});

// Heuristic procedural generator for instant response and offline fallback
function generateHeuristicBreakdown(params: {
  goal: string;
  totalDays: number;
  currentStatus?: string;
  dailyTime?: string;
  pacingStyle?: string;
  customNotes?: string;
}) {
  const { goal, totalDays, pacingStyle = 'front_loaded' } = params;
  const days = Math.max(3, totalDays);

  let mDays: number[] = [];
  let percentages: number[] = [];

  if (pacingStyle === 'front_loaded') {
    // Front-loaded: 20%, 50%, 80%, buffer at 90%, finish at 100%
    mDays = [
      Math.max(1, Math.round(days * 0.2)),
      Math.max(2, Math.round(days * 0.45)),
      Math.max(3, Math.round(days * 0.75)),
      Math.max(days - 2, Math.round(days * 0.9)),
      days,
    ];
    percentages = [25, 55, 85, 95, 100];
  } else if (pacingStyle === 'ramp_up') {
    mDays = [
      Math.max(1, Math.round(days * 0.25)),
      Math.max(2, Math.round(days * 0.55)),
      Math.max(3, Math.round(days * 0.8)),
      days,
    ];
    percentages = [20, 50, 80, 100];
  } else if (pacingStyle === 'buffer_first') {
    mDays = [
      Math.max(1, Math.round(days * 0.25)),
      Math.max(2, Math.round(days * 0.5)),
      Math.max(3, Math.round(days * 0.75)),
      Math.max(days - 1, Math.round(days * 0.85)),
      days,
    ];
    percentages = [30, 60, 90, 95, 100];
  } else {
    // steady
    mDays = [
      Math.max(1, Math.round(days * 0.25)),
      Math.max(2, Math.round(days * 0.5)),
      Math.max(3, Math.round(days * 0.75)),
      days,
    ];
    percentages = [25, 50, 75, 100];
  }

  // Deduplicate and sort days
  mDays = Array.from(new Set(mDays)).sort((a, b) => a - b);
  if (mDays[mDays.length - 1] !== days) {
    mDays.push(days);
  }

  const stageTemplates = [
    {
      title: '基礎固め＆初動の立ち上げ',
      desc: '全体の概要・道筋を把握し、最初のつまずきポイントを越える段階。環境や必要な道具・教材を揃え、全体の1/4に触れておく。',
      items: ['必要なリソース・教材・ツールの準備を完了する', '全体の目次や構成を一度ざっと通読・把握する', '最初の一番ハードルが低い部分を完了させる'],
      question: '迷わず日々の作業に着手できる状態が作れていますか？',
      recovery: 'もし遅れていても大丈夫。まずは「5分だけ触る」ことだけ意識してハードルを下げましょう。',
      isBuffer: false,
    },
    {
      title: '中盤の主力パート展開（山場）',
      desc: '一番作業量が多くなる中核部分を進める段階。習慣のリズムができてきて、全体の半分近くが見えてくる目安。',
      items: ['主要な課題やコアとなる第1目標を形にする', 'つまずいた箇所のメモを残しておく', '折り返し地点までの内容を一度簡単に振り返る'],
      question: '日々のペース配分が無理のないリズムになっていますか？',
      recovery: '完璧主義を捨てて「まずは60点の完成度で通り抜ける」ことを優先してください。',
      isBuffer: false,
    },
    {
      title: '全体の8割完成＆総仕上げ準備',
      desc: '全体のメイン作業をおおむね終え、ラストスパートへの橋渡しを行う段階。全体の形がはっきりと見え、ゴールが手の届く範囲になります。',
      items: ['主要コンテンツ・タスクの粗削りな完成', '未完了の残課題をリストアップして整理', '最終チェックのための要点まとめ'],
      question: '残りの作業量と残り日数のバランスは現実的ですか？',
      recovery: '残った細かいタスクのうち「絶対に外せない必須項目」だけに絞り込みましょう。',
      isBuffer: false,
    },
    {
      title: 'バッファ・調整＆最終ブラッシュアップ',
      desc: '遅れを取り戻すための予備期間、または細部の見直し・推敲を行う余裕のステージ。焦らずにクオリティを整えます。',
      items: ['予備日を活用した遅れ箇所のリカバリー', '全体を通した最終確認・見直し', '達成後の保存・提出・まとめ準備'],
      question: '心にゆとりを持って最終日を迎えられそうですか？',
      recovery: 'このバッファ期間があることで遅れは完全に取り戻せます。焦らず1つずつ消化しましょう。',
      isBuffer: true,
    },
    {
      title: '目標達成＆フィニッシュ',
      desc: '「' + goal + '」の最終完了！ここまで積み上げた成果を確認し、次のステップへ繋げるゴール。',
      items: ['最終成果物の確認と完了宣言', 'これまでの歩みを振り返り、自分を労う', '得られた学びを簡単にメモに残す'],
      question: '最初に描いた「ここまでやりたい」が形になりましたか？',
      recovery: 'もし一部残っていても、ここまで進めたこと自体が大きな前進です。胸を張りましょう！',
      isBuffer: false,
    },
  ];

  const milestones = mDays.map((day, idx) => {
    const pct = Math.min(100, Math.round(((idx + 1) / mDays.length) * 100));
    const tmpl =
      idx === mDays.length - 1
        ? stageTemplates[stageTemplates.length - 1]
        : stageTemplates[Math.min(idx, stageTemplates.length - 2)];

    return {
      day,
      percentage: pct,
      title: tmpl.title,
      targetDescription: tmpl.desc,
      checklistItems: tmpl.items,
      checkQuestion: tmpl.question,
      recoveryTip: tmpl.recovery,
      isBufferStage: tmpl.isBuffer || (idx === mDays.length - 2 && mDays.length >= 4),
    };
  });

  return {
    summary: `「${goal}」を${days}日間で無理なく形にするためのロードマップです。一気にやろうとせず、各チェックポイントでの到達目安を指標に進めましょう。`,
    pacingAdvice:
      pacingStyle === 'front_loaded'
        ? '最初の1/3の日数で勢いをつけておくと、後半に予期せぬ忙しさや疲労が来ても安心してバッファで調整できます。'
        : '毎日同じ時間・同じ場所で少しずつ手をつけることで、モチベーションの波に左右されずに完走できます。',
    dailyRecommendedPace: `全体の作業量を${days}日で割ったペース（1日あたり全体の約${Math.max(
      1,
      Math.round(100 / days)
    )}%を目安に進行）`,
    milestones,
    celebrationMessage: `おめでとうございます！${days}日間の計画を着実に達成し、「${goal}」をやり遂げました！`,
  };
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
