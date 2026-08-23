// ────────────────────────────────────────────────────────────
// 問題分析器 ＋ 推薦引擎（Rule-Based，完全不需要呼叫任何 AI API）
//
// analyzeQuestion()：把使用者輸入的一段文字，對應到「問題意圖」
// recommendSystems()：根據分析結果 + 系統資料庫，算出每個系統的適合度分數（1-5 星）
//
// 想要調整「關鍵字判斷的準確度」→ 改 src/data/intents.ts 的 keywords
// 想要調整「哪些意圖該推薦哪些系統」→ 改 src/data/recommendationRules.ts
// 想要調整「評分公式的權重」→ 改這個檔案裡的 SCORE_WEIGHTS
// ────────────────────────────────────────────────────────────
import { intentDefinitions } from "@/data/intents";
import { recommendationRules } from "@/data/recommendationRules";
import { systems } from "@/data/systems";
import type {
  DivinationSystem,
  QuestionAnalysis,
  QuestionIntent,
  RequiredInformation,
  Specificity,
  TimeOrientation,
  UserProfile,
} from "@/types/divination";

// ── 問題分析器 ──────────────────────────────────────────────

const futureKeywords = ["今年", "明年", "未來", "以後", "接下來", "將來", "future", "next year", "ahead"];
const pastKeywords = ["過去", "以前", "為什麼會這樣", "past", "used to", "why did"];
const presentKeywords = ["現在", "目前", "當下", "now", "currently"];

/** 每種 specificity 在光譜上的位置，用來判斷「相鄰」specificity（評分時用） */
const specificityOrder: Specificity[] = [
  "broad-life",
  "life-phase",
  "specific-question",
  "single-event",
  "symbolic-reflection",
];

/** 每個意圖預設偏向的 specificity（沒有更明確線索時的預設值） */
const intentSpecificityHint: Partial<Record<QuestionIntent, Specificity>> = {
  Career: "life-phase",
  "Job Change": "life-phase",
  Business: "life-phase",
  Money: "life-phase",
  "Investment Decision": "specific-question",
  Love: "life-phase",
  Marriage: "life-phase",
  Compatibility: "life-phase",
  Relationship: "life-phase",
  Breakup: "single-event",
  Family: "life-phase",
  "Life Purpose": "broad-life",
  "Soul Purpose": "broad-life",
  "Personal Growth": "broad-life",
  Future: "life-phase",
  Timing: "specific-question",
  Decision: "specific-question",
  "Specific Event": "single-event",
  Past: "symbolic-reflection",
  Karma: "symbolic-reflection",
  "Past Life": "symbolic-reflection",
  Spirituality: "symbolic-reflection",
  Dreams: "symbolic-reflection",
  Personality: "broad-life",
  "Self Understanding": "broad-life",
};

function countKeywordHits(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((count, kw) => (lower.includes(kw.toLowerCase()) ? count + 1 : count), 0);
}

/** 用關鍵字比對，把使用者輸入的問題文字分析成 QuestionAnalysis */
export function analyzeQuestion(rawQuestion: string): QuestionAnalysis {
  const question = rawQuestion.trim();

  const matches = intentDefinitions
    .map((def) => ({ intent: def.id, hits: countKeywordHits(question, def.keywords) }))
    .filter((m) => m.hits > 0)
    .sort((a, b) => b.hits - a.hits);

  // 完全比對不到關鍵字時，給一個中性的預設意圖，讓後面流程不會空手而回
  const fallbackIntents: QuestionIntent[] = ["Decision", "Self Understanding"];
  const matchedIntents = matches.length > 0 ? matches.map((m) => m.intent) : fallbackIntents;

  const primaryIntent = matchedIntents[0];
  const secondaryIntents = matchedIntents.slice(1, 4);

  const timeOrientation: TimeOrientation[] = [];
  if (countKeywordHits(question, futureKeywords) > 0) timeOrientation.push("future");
  if (countKeywordHits(question, pastKeywords) > 0) timeOrientation.push("past");
  if (countKeywordHits(question, presentKeywords) > 0) timeOrientation.push("present");
  if (timeOrientation.length === 0) timeOrientation.push("present", "future");

  const specificity = intentSpecificityHint[primaryIntent] ?? "life-phase";

  const recommendedSystemIds = rankSystemsForIntents(matchedIntents);

  const explanation =
    matches.length > 0
      ? `從你的問題裡，我們偵測到主要跟「${getIntentLabelSafe(primaryIntent)}」有關${
          secondaryIntents.length > 0
            ? `，也帶有一些「${secondaryIntents.map(getIntentLabelSafe).join("、")}」的成分`
            : ""
        }，所以優先推薦擅長處理這類主題的系統。`
      : "沒有偵測到明確的關鍵字，先給你幾個泛用型、適合探索自我與做決策的系統，你也可以換個說法再試一次。";

  return {
    originalQuestion: question,
    primaryIntent,
    secondaryIntents,
    timeOrientation,
    specificity,
    recommendedSystemIds,
    explanation,
  };
}

function getIntentLabelSafe(id: QuestionIntent): string {
  return intentDefinitions.find((i) => i.id === id)?.label ?? id;
}

/** 依照命中的意圖清單，彙整規則表裡對應的系統 id，依出現頻率排序 */
function rankSystemsForIntents(intents: QuestionIntent[]): string[] {
  const scoreById = new Map<string, number>();
  intents.forEach((intent, intentIndex) => {
    const weight = intentIndex === 0 ? 3 : 1; // 主要意圖權重較高
    const ids = recommendationRules[intent] ?? [];
    ids.forEach((id, positionInList) => {
      const positionBonus = Math.max(0, ids.length - positionInList); // 規則表裡排越前面分數越高
      scoreById.set(id, (scoreById.get(id) ?? 0) + weight * positionBonus);
    });
  });
  return [...scoreById.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

// ── 評分引擎（1-5 星） ────────────────────────────────────────

export interface SystemRecommendation {
  system: DivinationSystem;
  score: number; // 0-100
  stars: number; // 1-5
  reasons: string[];
}

const SCORE_WEIGHTS = {
  intentMatch: 40,
  informationMatch: 20,
  timeMatch: 15,
  specificityMatch: 15,
  traditionalStrength: 10,
};

function specificityDistance(a: Specificity, b: Specificity): number {
  return Math.abs(specificityOrder.indexOf(a) - specificityOrder.indexOf(b));
}

/** 使用者目前 Profile 裡，已經填了哪些欄位（對應 RequiredInformation） */
function profileFilledFields(profile?: UserProfile): Set<RequiredInformation> {
  const filled = new Set<RequiredInformation>();
  if (!profile) return filled;
  if (profile.birthDate) filled.add("birthDate");
  if (profile.birthTime) filled.add("birthTime");
  if (profile.birthPlace) filled.add("birthPlace");
  if (profile.currentLocation) filled.add("currentLocation");
  if (profile.gender) filled.add("gender");
  if (profile.relationshipStatus) filled.add("relationshipStatus");
  if (profile.name) {
    filled.add("name");
    filled.add("fullName");
  }
  return filled;
}

/** 針對「單一系統」計算適合度分數與原因說明 */
export function scoreSystem(
  system: DivinationSystem,
  analysis: QuestionAnalysis,
  profile?: UserProfile
): SystemRecommendation {
  const reasons: string[] = [];

  // 1) intentMatch：這個系統在規則表命中意圖清單裡的排名位置
  const rankIndex = analysis.recommendedSystemIds.indexOf(system.id);
  const intentMatch =
    rankIndex === -1 ? 0.15 : Math.max(0.3, 1 - rankIndex / Math.max(10, analysis.recommendedSystemIds.length));
  if (rankIndex !== -1 && rankIndex < 5) {
    reasons.push(`很適合處理「${getIntentLabelSafe(analysis.primaryIntent)}」類型的提問`);
  }

  // 2) informationMatch：使用者目前已經準備好的資料，跟這個系統需要的資料重疊多少
  const filled = profileFilledFields(profile);
  const required = system.requiredInformation.filter(
    (r) => !["question", "randomSelection", "cards", "dice", "context", "specificEvent", "dreamDescription", "photo", "handPhoto"].includes(r)
  );
  const informationMatch =
    required.length === 0 ? 0.9 : required.filter((r) => filled.has(r)).length / required.length || 0.5;
  if (required.length === 0) {
    reasons.push("不需要提供出生資料，馬上就能開始");
  } else if (informationMatch >= 0.99) {
    reasons.push("你目前的個人資料剛好足夠這個系統使用");
  }

  // 3) timeMatch：時間取向重疊程度
  const overlap = system.timeOrientation.filter((t) => analysis.timeOrientation.includes(t)).length;
  const timeMatch = overlap > 0 ? Math.min(1, overlap / analysis.timeOrientation.length) : 0.2;
  if (overlap > 0) reasons.push("關注的時間軸跟你的問題方向一致");

  // 4) specificityMatch：解讀顆粒度是否符合問題的具體程度
  const distance = specificityDistance(system.specificity, analysis.specificity);
  const specificityMatch = distance === 0 ? 1 : distance === 1 ? 0.6 : distance === 2 ? 0.3 : 0.1;
  if (distance === 0) reasons.push("解讀的顆粒度（範圍大小）跟你的問題剛好吻合");

  // 5) traditionalStrength：用 aiSuitability 當作「適合文字 AI 解讀」的代理指標
  const traditionalStrength = system.aiSuitability / 5;

  const score =
    intentMatch * SCORE_WEIGHTS.intentMatch +
    informationMatch * SCORE_WEIGHTS.informationMatch +
    timeMatch * SCORE_WEIGHTS.timeMatch +
    specificityMatch * SCORE_WEIGHTS.specificityMatch +
    traditionalStrength * SCORE_WEIGHTS.traditionalStrength;

  const stars = Math.max(1, Math.min(5, Math.round(score / 20)));

  if (reasons.length === 0) reasons.push("跟你的問題有一定程度的相關性，可以作為額外參考");

  return { system, score: Math.round(score), stars, reasons };
}

/** 產生完整排序後的推薦清單（給 /analyzer 頁面用） */
export function recommendSystems(analysis: QuestionAnalysis, profile?: UserProfile, limit = 8): SystemRecommendation[] {
  return systems
    .map((s) => scoreSystem(s, analysis, profile))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
