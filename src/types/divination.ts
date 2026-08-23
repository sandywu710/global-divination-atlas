// ────────────────────────────────────────────────────────────
// Global Divination Atlas — 核心資料型別
// 這裡定義的是「一個占卜／命理／靈性系統」長什麼樣子。
// 之後要新增或修改系統資料，只需要照著這個型別去 src/data/systems.ts 加資料，
// 不需要改任何程式邏輯。
// ────────────────────────────────────────────────────────────
import type { InputMode, RandomDrawConfig } from "./randomDraw";

/** 使用者需要提供什麼類型的資料，系統才能進行解讀 */
export type InputType =
  | "birthData"
  | "question"
  | "randomDraw"
  | "photo"
  | "textSelection"
  | "dreamDescription";

/** 系統所屬的文化／類別分類（用於 /explore 篩選） */
export type SystemCategory =
  | "Astrology"
  | "Chinese Divination"
  | "Indian Divination"
  | "Japanese Divination"
  | "Korean Divination"
  | "Tibetan Divination"
  | "Western Esotericism"
  | "Tarot"
  | "Cartomancy"
  | "Runes"
  | "Geomancy"
  | "Numerology"
  | "African Divination"
  | "Dream Divination"
  | "Spirituality"
  | "Energy"
  | "Symbolic"
  | "Modern Esoteric";

/** 這個系統擅長探索的主題 */
export type ExplorationType =
  | "Personality"
  | "Life Pattern"
  | "Career"
  | "Money"
  | "Love"
  | "Marriage"
  | "Relationships"
  | "Family"
  | "Health Symbolism"
  | "Decision"
  | "Timing"
  | "Future Trends"
  | "Specific Event"
  | "Past"
  | "Past Life"
  | "Karma"
  | "Soul Purpose"
  | "Spiritual Growth"
  | "Life Mission"
  | "Shadow"
  | "Inner World"
  | "Energy"
  | "Dreams";

/** 使用這個系統之前，使用者需要準備的資訊 */
export type RequiredInformation =
  | "birthDate"
  | "birthTime"
  | "birthPlace"
  | "currentLocation"
  | "question"
  | "gender"
  | "relationshipStatus"
  | "partnerBirthData"
  | "otherPersonBirthData"
  | "photo"
  | "handPhoto"
  | "dreamDescription"
  | "randomSelection"
  | "cards"
  | "dice"
  | "context"
  | "specificEvent"
  | "name"
  | "fullName";

/** 這個系統看的時間軸方向 */
export type TimeOrientation = "past" | "present" | "future" | "timeless" | "lifeCycle";

/** 這個系統的解讀顆粒度：從「一輩子的結構」到「單一事件」到「純象徵反思」 */
export type Specificity =
  | "broad-life"
  | "life-phase"
  | "specific-question"
  | "single-event"
  | "symbolic-reflection";

export interface DivinationSystem {
  id: string;
  name: string;
  /** 原文名稱，例如中文、梵文、日文等 */
  nativeNames?: string[];
  /** 起源地區，用於 /explore 的 Region 篩選 */
  region: string[];
  culturalOrigin: string;
  category: SystemCategory[];
  /** 起源年代的簡短描述，例如「約西元前 11 世紀」 */
  era?: string;
  description: string;
  whatItCanExplore: ExplorationType[];
  idealQuestions: string[];
  requiredInformation: RequiredInformation[];
  optionalInformation?: RequiredInformation[];
  inputType: InputType[];
  timeOrientation: TimeOrientation[];
  specificity: Specificity;
  /** AI 適合度，1-5，代表「這套系統適合交給文字型 AI 做解讀」的程度 */
  aiSuitability: number;
  requiresCalculation: boolean;
  requiresRandomization: boolean;
  requiresImage: boolean;
  /** 這個系統對「靈性宣稱」的強度，用來決定 Prompt 要加多強的警語 */
  spiritualClaimLevel: "symbolic" | "traditional" | "spiritual";
  promptLanguage: "English";
  methodologySummary: string;
  limitations: string;
  relatedSystems?: string[];
  /** 套用 promptTemplate.ts 模板、代入變數後的個別化 Prompt 說明片段 */
  promptTemplate: string;

  // ── 以下為 Random Draw 功能新增欄位，全部 optional，既有系統不用補 ──
  /** 這個系統需要的輸入型態（新版，取代/補充舊的 inputType）。沒有填的系統維持原本行為 */
  inputMode?: InputMode[];
  /** 是否需要使用者在網站上真正完成隨機抽取（洗牌／擲筊等），預設 false */
  requiresRandomDraw?: boolean;
  /** requiresRandomDraw 為 true 時才需要填，描述牌組／抽取規則 */
  randomDraw?: RandomDrawConfig;
}

/** 問題意圖分類（Question Intent Taxonomy） */
export type QuestionIntent =
  | "Career"
  | "Job Change"
  | "Business"
  | "Money"
  | "Investment Decision"
  | "Love"
  | "Marriage"
  | "Compatibility"
  | "Relationship"
  | "Breakup"
  | "Family"
  | "Life Purpose"
  | "Soul Purpose"
  | "Personal Growth"
  | "Future"
  | "Timing"
  | "Decision"
  | "Specific Event"
  | "Past"
  | "Karma"
  | "Past Life"
  | "Spirituality"
  | "Dreams"
  | "Personality"
  | "Self Understanding";

export interface QuestionAnalysis {
  originalQuestion: string;
  primaryIntent: QuestionIntent;
  secondaryIntents: QuestionIntent[];
  timeOrientation: TimeOrientation[];
  specificity: Specificity;
  recommendedSystemIds: string[];
  explanation: string;
}

/** 使用者存在 LocalStorage 的個人資料（Profile），Prompt 產生器會自動帶入 */
export interface UserProfile {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  currentLocation?: string;
  gender?: string;
  relationshipStatus?: string;
}

/** Prompt 品質模式 */
export type PromptMode = "Quick" | "Standard" | "Deep Research" | "Expert";
