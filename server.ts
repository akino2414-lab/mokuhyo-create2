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
      category = 'general',
      currentStatus = '未着手',
      dailyTime = '1日30分〜1時間程度',
      pacingStyle = 'front_loaded',
      customNotes = '',
    } = req.body;

    if (!goal || !totalDays || totalDays <= 0) {
      return res.status(400).json({ error: '目標と日数は必須です。' });
    }

    // Category specific guidance
    const categoryDescriptions: Record<string, string> = {
      study: '【勉強・資格・読書系】章ごとの理解、過去問演習、暗記定着、模試・総復習などの学習サイクルに特化したチェックポイントと到達基準を設定する。',
      project: '【制作・開発・仕事・副業系】要件定義・構成案、プロトタイプ作成、主要機能実装、テスト・推敲、デプロイ・公開などの成果物制作に特化したチェックポイントを設定する。',
      habit: '【習慣・健康・ダイエット系】最初の行動ハードル最小化、継続の定着判定、モチベーション低下期の乗り越え方、数値目標測定に特化したチェックポイントを設定する。',
      life: '【生活・片付け・断捨離系】エリア別の仕分け、不用品の処分・回収日、整理整頓、維持ルールの確立に特化したチェックポイントを設定する。',
      general: '【汎用】目標の特性（知識習得型か、作業完了型か、習慣化型か）を見極めて最適なチェックポイントを設定する。',
    };

    const categoryGuide = categoryDescriptions[category] || categoryDescriptions.general;

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
          category,
          currentStatus,
          dailyTime,
          pacingStyle,
          customNotes,
        }),
      });
    }

    const systemPrompt = `あなたは目標達成とプロジェクトペース配分の専門コーチです。
ユーザーは「◯日でここまでやりたい」という具体的な目標を持っています。
これに対して、目標の種類や特性（資格試験の勉強、ポートフォリオ制作、部屋の片付け、ダイエット習慣など）に【完全に適合した】実践的でリアルな中間チェックポイント（マイルストーン）を提案してください。

重要指針:
1. 【目標内容に特化したチェック項目】: 抽象的で汎用的な表現（「基礎を固める」など）だけで済まさず、ユーザーの目標「${goal}」の文脈に応じた具体的な教材名、章節、実装ステップ、片付けエリア、チェック項目を必ず入れてください。
2. 3〜5個程度の中間マイルストーンを設定すること。
3. カテゴリ特性（${categoryGuide}）を踏まえたマイルストーンの性質（stageType: setup, practice, refine, buffer, finish）を割り当てること。
4. それぞれのマイルストーンで「何日目頃（Day X）にどこまで到達していれば合格か（理想の到達目安）」を具体的に言語化すること。
5. 「ここでのチェックポイント（自分への確認項目）」および「具体的なチェックリストタスク」を入れること。
6. 万が一遅れた場合の「リカバリー策・焦らないための処方箋」を必ず提示すること。
7. 指定されたペース配分（${pacingGuide}）を反映させること。特に最終盤には予備日（バッファ）を設けること。
8. 返答は日本語で、ユーザーが「これならできそう！」と安心できる温かく前向きなトーンにすること。`;

    const prompt = `目標: "${goal}"
目標カテゴリ: ${category} (${categoryGuide})
目標期間: ${totalDays}日間
現在の状況: ${currentStatus}
1日の作業/活動目安: ${dailyTime}
ペース配分タイプ: ${pacingStyle} (${pacingGuide})
補足・こだわり: ${customNotes || '特になし'}

上記を分析し、目標の種類に深く根ざした最適な中間目標計画をJSON形式で作成してください。`;

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
                    description: 'この中間目標のタイトル（目標に特化した具体的な表現）',
                  },
                  targetDescription: {
                    type: Type.STRING,
                    description: '「この辺でここまでやっておくと良い」具体的な到達状態',
                  },
                  stageType: {
                    type: Type.STRING,
                    enum: ['setup', 'practice', 'refine', 'buffer', 'finish'],
                    description: 'このチェックポイントの段階性質',
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
  category?: string;
  currentStatus?: string;
  dailyTime?: string;
  pacingStyle?: string;
  customNotes?: string;
}) {
  const { goal, totalDays, category = 'general', pacingStyle = 'front_loaded' } = params;
  const days = Math.max(3, totalDays);

  let mDays: number[] = [];
  let percentages: number[] = [];

  if (pacingStyle === 'front_loaded') {
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

  // Detect category from keywords if general
  let detectedCategory = category;
  if (detectedCategory === 'general') {
    if (/資格|簿記|TOEIC|試験|勉強|テキスト|単語|読書|本|覚える|暗記/i.test(goal)) {
      detectedCategory = 'study';
    } else if (/アプリ|Web|サイト|制作|開発|ポートフォリオ|動画|原稿|執筆|ブログ|イラスト/i.test(goal)) {
      detectedCategory = 'project';
    } else if (/筋トレ|運動|ダイエット|ランニング|体重|早起き|習慣|ウォーキング/i.test(goal)) {
      detectedCategory = 'habit';
    } else if (/片付け|部屋|断捨離|メルカリ|掃除|整理/i.test(goal)) {
      detectedCategory = 'life';
    }
  }

  // Category specific stage templates
  const categoryTemplates: Record<string, any[]> = {
    study: [
      {
        title: '導入＆全体像の把握・第1セクション走破',
        desc: `「${goal}」のテキストや出題範囲の全体目次を把握し、序盤の基礎章を一気に通読する段階。細部の完全暗記より「全体の地図」を頭に入れるのが目標。`,
        stageType: 'setup',
        items: ['教材・ノート等の学習環境を整える', '全体の目次を通読し、章ごとの分量を把握する', '第1〜2章の解説を読み、例題を解く'],
        question: '分からない用語が出てきても立ち止まらずに読み進められていますか？',
        recovery: '深追いせず付箋を貼るだけにして、まずは全体を前に進めることを優先しましょう。',
        isBuffer: false,
      },
      {
        title: '主要範囲の網羅・頻出テーマのインプット',
        desc: '試験・学習の最頻出コア部分を集中攻略する山場。基礎知識を問題演習と結びつけ、合格基準の土台を築く目安。',
        stageType: 'practice',
        items: ['主要テーマの講義・解説パートを一通り終わらせる', '各章の基本演習問題を1周解く', '間違えた問題にチェックをつけ、解説を読む'],
        question: '基本問題の解法パターンが頭に浮かぶようになってきましたか？',
        recovery: '間違えた問題すべてを理解しようとせず、正答率の高いAランク問題だけ復習しましょう。',
        isBuffer: false,
      },
      {
        title: '実践演習＆弱点論点の洗い出し',
        desc: '本番形式の過去問や総合問題に挑戦し、得点力の穴を見つける段階。インプットからアウトプット中心へ切り替えます。',
        stageType: 'refine',
        items: ['実践過去問・総合テストを1回分解いて採点する', '苦手な分野・間違いの多い論点をリスト化する', '要点まとめシートや暗記カードを確認する'],
        question: '自分の得意・不得意な分野が明確になりましたか？',
        recovery: '点数が低くても全く落ち込む必要はありません。今間違えた分だけ本番で得点できます。',
        isBuffer: false,
      },
      {
        title: '直前総復習＆バッファ（弱点集中補強）',
        desc: '遅れの取り戻しと頻出論点の最終確認を行う予備期間。新しい問題集には手を出さず、間違えた問題の反復に徹します。',
        stageType: 'buffer',
        items: ['チェックマークのついた間違え問題を解き直す', '基本用語・公式・定義の最終暗記確認', '本番スケジュールの持ち物・体調チェック'],
        question: '過去に間違えた問題が自力で解けるようになっていますか？',
        recovery: 'このバッファ期間を使って確実に基礎を固め直せます。リラックスして復習しましょう。',
        isBuffer: true,
      },
      {
        title: '目標達成＆本番完走・学習完了宣言',
        desc: `「${goal}」の学習工程をすべて完了！努力の成果を自信に変えてゴールを迎える段階。`,
        stageType: 'finish',
        items: ['全範囲の総点検完了を宣言する', '学習継続を支えた自分を大いに労う', '次の実践やステップの予定を立てる'],
        question: 'スタート時と比べて知識と理解が確実に積み上がった実感はありますか？',
        recovery: 'やり切ったこと自体が最大の自信です。胸を張って本番や次のステージへ！',
        isBuffer: false,
      },
    ],
    project: [
      {
        title: '要件・構成定義＆土台のプロトタイプ作成',
        desc: `「${goal}」に必要な要素を洗い出し、最小限の骨組み（ワイヤーフレームや粗い骨子）を最速で立ち上げる段階。`,
        stageType: 'setup',
        items: ['必要な機能・目次・素材をリストアップする', '開発環境・ファイル構成のセットアップ', '骨組み（動くプロトタイプ・枠組み）を作成する'],
        question: '完璧を目指さず、まずは一番簡素な形で動かせていますか？',
        recovery: 'デザインや細部へのこだわりは後回しにして、まずは骨組みだけ完成させましょう。',
        isBuffer: false,
      },
      {
        title: '中核機能・メインコンテンツの実装と制作',
        desc: 'プロジェクトの肝となるコア要素を集中的に形にする段階。全体の60%以上のボリュームがこの段階で完成します。',
        stageType: 'practice',
        items: ['主要な機能・メインコンテンツをすべて作成する', '仮データから実データ・本番テキストへ差し替える', '動かない箇所やレイアウト崩れをメモしておく'],
        question: 'メイン機能が一通り形になって動く状態になりましたか？',
        recovery: '「あったら良いな」程度の機能は切り捨て、必須機能に絞り込んで進行しましょう。',
        isBuffer: false,
      },
      {
        title: 'デザイン・推敲・動作確認＆実機テスト',
        desc: '完成した制作物のクオリティを底上げする段階。バグ修正、スマホ表示確認、表現のブラッシュアップを行います。',
        stageType: 'refine',
        items: ['全体を通して操作・通読し、不具合や誤字をチェック', 'デザインやレイアウトの細部を整える', '友人や第三者目線で使いやすさを再確認'],
        question: '客観的に見て使いやすく、意図が伝わる仕上がりになっていますか？',
        recovery: '細かい粗が気になっても、致命的なバグがなければ公開・提出を優先して構いません。',
        isBuffer: false,
      },
      {
        title: '公開・提出準備＆バッファ調整',
        desc: '急なトラブルや想定外の修正を吸収するための予備日。提出やデプロイの手順を前もって確認し、安全に完了へ導きます。',
        stageType: 'buffer',
        items: ['デプロイ・提出用ファイル・説明文の用意', '予備日を活用した最終動作・表示確認', '公開後の告知や保管場所の準備'],
        question: 'いつでも公開・提出できる状態に整いましたか？',
        recovery: 'バッファ日を丸々使って落ち着いて最終確認できるので安心してください。',
        isBuffer: true,
      },
      {
        title: 'ローンチ・公開完了＆プロジェクト完走！',
        desc: `「${goal}」の制作物が晴れて完成・公開！形にした喜びを味わい、実績として記録します。`,
        stageType: 'finish',
        items: ['制作物の公開・提出・保存を完了する', 'ポートフォリオや活動ログに実績として追加', '工夫した点や学んだ技術をメモに残す'],
        question: '自分の手でゼロから形にした達成感を感じられていますか？',
        recovery: '公開した時点で大成功です。フィードバックを受けて後からいくらでも改善できます！',
        isBuffer: false,
      },
    ],
    habit: [
      {
        title: '超スモールステップでの初動と習慣の種まき',
        desc: `「${goal}」のハードルを極限まで下げ、「毎日5分だけ」「着替えるだけ」などゼロを回避して行動を定着させる段階。`,
        stageType: 'setup',
        items: ['やる時間帯・トリガー（例: 朝起きたらすぐ）を決める', '道具やウェアを常に手の届く場所にセットしておく', '初日は目標の30%程度の軽さで完了して成功体験を作る'],
        question: '「これならどんなに疲れていてもできる」小さな一歩で始められていますか？',
        recovery: 'できなかった日は「1分だけ触る・意識する」だけでもOKとして継続を途切れさせないようにしましょう。',
        isBuffer: false,
      },
      {
        title: 'リズムの確立＆日常ルーティンへの統合',
        desc: '意志の力を使わずに、歯磨きと同じように体が自然と動く状態を目指す段階。少しずつ負荷を本来のペースへ引き上げます。',
        stageType: 'practice',
        items: ['毎日記録をつけて継続カレンダーを埋める', '規定のメニュー・運動量を無理のない範囲でこなす', '気分が乗らないときの「逃げ道メニュー」を用意する'],
        question: '決めた時間になるとスムーズに行動に移せるようになってきましたか？',
        recovery: '1日サボってしまっても「2日連続で休まない」ことさえ守れば習慣は途切れません。',
        isBuffer: false,
      },
      {
        title: '中だるみ・マンネリ防止＆小さな変化の確認',
        desc: '開始から一定期間が経ち、効果や変化が少しずつ見え始める段階。飽きを防ぐために小さな工夫やバリエーションを加えます。',
        stageType: 'refine',
        items: ['体重・測定値・記録を振り返り、変化をメモする', '新しいメニューやコース・ご褒美を取り入れて気分転換', 'モチベーション低下の要因を特定して対策する'],
        question: '体調や気分、日々の充実感に前向きな変化を感じられていますか？',
        recovery: '体重や数値に一喜一憂せず、「今日も行動できた」という行動そのものを褒めてあげましょう。',
        isBuffer: false,
      },
      {
        title: '調整・休息バッファ＆継続維持プラン',
        desc: '疲れが溜まった時のための休息・調整日。無理な追い込みをせず、一生続けられる持続可能なペースにチューニングします。',
        stageType: 'buffer',
        items: ['疲れた日は完全休息または軽いストレッチに充てる', '無理のあった部分の強度を現実的な水準に再調整', '今後も無理なく続けられる仕組みを整える'],
        question: '息切れせずに自然体で続けられるペースを見つけられましたか？',
        recovery: '休息も習慣の一部です。休んだ自分を責めず、リフレッシュして再開しましょう。',
        isBuffer: true,
      },
      {
        title: '習慣化達成＆新しい生活スタイルの定着！',
        desc: `「${goal}」の全期間を完走！三日坊主を乗り越え、自分の当たり前の日常として定着したゴール。`,
        stageType: 'finish',
        items: ['期間完走の記録をつけて自分に最高の褒美をあげる', 'スタート前と現在の変化を比較して実感する', '今後の維持ルール（週◯回など）を決める'],
        question: '最初の一歩と比べて、自分が一回り成長した実感がありますか？',
        recovery: 'ここまで続けられたあなたの継続力は本物です。自分に大きな拍手を！',
        isBuffer: false,
      },
    ],
    life: [
      {
        title: 'エリアの現状把握＆仕分け基準の決定',
        desc: `「${goal}」の対象エリアを小さなゾーンに分割し、「残す／捨てる／保留」の明確なルールを決めて初動を打つ段階。`,
        stageType: 'setup',
        items: ['ゴミ袋・段ボール・掃除用具を用意する', '作業エリアを3〜4ブロックに分割して順番を決める', '一番簡単で達成感の出やすい引き出し1段から着手'],
        question: '一気に全部やろうとせず、今日やるエリアを絞り込めていますか？',
        recovery: '部屋全体を見渡すと途方に暮れるので、目の前の「幅50cmのスペース」だけに集中しましょう。',
        isBuffer: false,
      },
      {
        title: '集中仕分け＆不用品の思い切った選別',
        desc: '一番物量が多くなるメインエリアの仕分けを進める山場。迷うものは「保留箱」に入れてスピードを保ちます。',
        stageType: 'practice',
        items: ['メインのクローゼットや棚の中身を全出しして仕分ける', '明らかなゴミ・不用品を袋に詰めて即座にまとめる', 'メルカリやリサイクル候補を1箇所に集める'],
        question: '「いつか使うかも」を勇気を持って手放せていますか？',
        recovery: '判断に10秒以上迷う物は一旦「保留箱」に入れて後回しにすれば作業が止まりません。',
        isBuffer: false,
      },
      {
        title: '不用品の搬出・売却＆収納配置の最適化',
        desc: '仕分けで出たゴミの回収日出しや出品を行い、残した必要な物を使いやすく定位置に収める段階。',
        stageType: 'refine',
        items: ['ゴミの回収日に合わせて確実に家の外へ搬出する', 'フリマアプリへの出品または買取業者への持ち込み', 'よく使う物の定位置を決め、使いやすい高さに収納'],
        question: '床や机の上に物が置かれていないスッキリした空間が見えてきましたか？',
        recovery: '売れ残った出品物は期限（1週間など）を決めて寄付や廃棄に切り替えると滞りません。',
        isBuffer: false,
      },
      {
        title: '予備日＆最終拭き掃除・リバウンド防止策',
        desc: 'ゴミ収集のタイミング待ちや細部の拭き掃除を行う余裕のステージ。散らからない新ルールを確立します。',
        stageType: 'buffer',
        items: ['予備日を使って残った細々した物の整理を完了', '棚や床を水拭き・掃除機でピカピカに磨き上げる', '「1つ買ったら1つ手放す」リバウンド防止ルールを策定'],
        question: '空間だけでなく、心まで身軽になった爽快感を味わえていますか？',
        recovery: 'この予備日があることで焦らず綺麗に片付け切れます。ゆっくり掃除しましょう。',
        isBuffer: true,
      },
      {
        title: '片付け完了＆理想の快適空間の完成！',
        desc: `「${goal}」を見事にやり遂げました！整った空間と、不要な物を手放して軽やかになった暮らしのスタート。`,
        stageType: 'finish',
        items: ['片付け完了後のスッキリした部屋の写真を撮る', '綺麗になった空間で好きなお茶やコーヒーをゆっくり楽しむ', 'この身軽さをキープすることを自分と約束する'],
        question: '自分の暮らしを自分でコントロールできた満足感がありますか？',
        recovery: '片付け切った達成感は一生の財産です。本当にお疲れ様でした！',
        isBuffer: false,
      },
    ],
    general: [
      {
        title: '基礎固め＆初動の立ち上げ',
        desc: `「${goal}」の全体の概要・道筋を把握し、最初のつまずきポイントを越える段階。環境や必要な道具・教材を揃え、全体の1/4に触れておく。`,
        stageType: 'setup',
        items: ['必要なリソース・道具・環境の準備を完了する', '全体の目次や構成を一度ざっと通読・把握する', '最初の一番ハードルが低い部分を完了させる'],
        question: '迷わず日々の作業に着手できる状態が作れていますか？',
        recovery: 'もし遅れていても大丈夫。まずは「5分だけ触る」ことだけ意識してハードルを下げましょう。',
        isBuffer: false,
      },
      {
        title: '中盤の主力パート展開（山場）',
        desc: '一番作業量が多くなる中核部分を進める段階。習慣のリズムができてきて、全体の半分近くが見えてくる目安。',
        stageType: 'practice',
        items: ['主要な課題やコアとなる第1目標を形にする', 'つまずいた箇所のメモを残しておく', '折り返し地点までの内容を一度簡単に振り返る'],
        question: '日々のペース配分が無理のないリズムになっていますか？',
        recovery: '完璧主義を捨てて「まずは60点の完成度で通り抜ける」ことを優先してください。',
        isBuffer: false,
      },
      {
        title: '全体の8割完成＆総仕上げ準備',
        desc: '全体のメイン作業をおおむね終え、ラストスパートへの橋渡しを行う段階。全体の形がはっきりと見え、ゴールが手の届く範囲になります。',
        stageType: 'refine',
        items: ['主要コンテンツ・タスクの粗削りな完成', '未完了の残課題をリストアップして整理', '最終チェックのための要点まとめ'],
        question: '残りの作業量と残り日数のバランスは現実的ですか？',
        recovery: '残った細かいタスクのうち「絶対に外せない必須項目」だけに絞り込みましょう。',
        isBuffer: false,
      },
      {
        title: 'バッファ・調整＆最終ブラッシュアップ',
        desc: '遅れを取り戻すための予備期間、または細部の見直し・推敲を行う余裕のステージ。焦らずにクオリティを整えます。',
        stageType: 'buffer',
        items: ['予備日を活用した遅れ箇所のリカバリー', '全体を通した最終確認・見直し', '達成後の保存・提出・まとめ準備'],
        question: '心にゆとりを持って最終日を迎えられそうですか？',
        recovery: 'このバッファ期間があることで遅れは完全に取り戻せます。焦らず1つずつ消化しましょう。',
        isBuffer: true,
      },
      {
        title: '目標達成＆フィニッシュ',
        desc: `「${goal}」の最終完了！ここまで積み上げた成果を確認し、次のステップへ繋げるゴール。`,
        stageType: 'finish',
        items: ['最終成果物の確認と完了宣言', 'これまでの歩みを振り返り、自分を労う', '得られた学びを簡単にメモに残す'],
        question: '最初に描いた「ここまでやりたい」が形になりましたか？',
        recovery: 'もし一部残っていても、ここまで進めたこと自体が大きな前進です。胸を張りましょう！',
        isBuffer: false,
      },
    ],
  };

  const selectedTemplates = categoryTemplates[detectedCategory] || categoryTemplates.general;

  const milestones = mDays.map((day, idx) => {
    const pct = Math.min(100, Math.round(((idx + 1) / mDays.length) * 100));
    const tmpl =
      idx === mDays.length - 1
        ? selectedTemplates[selectedTemplates.length - 1]
        : selectedTemplates[Math.min(idx, selectedTemplates.length - 2)];

    return {
      day,
      percentage: pct,
      title: tmpl.title,
      targetDescription: tmpl.desc,
      stageType: tmpl.stageType,
      checklistItems: tmpl.items,
      checkQuestion: tmpl.question,
      recoveryTip: tmpl.recovery,
      isBufferStage: tmpl.isBuffer || (idx === mDays.length - 2 && mDays.length >= 4),
    };
  });

  return {
    summary: `「${goal}」の特性に合わせた${days}日間の専用ロードマップです。一気にやろうとせず、各チェックポイントでの到達目安を指標に進めましょう。`,
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
