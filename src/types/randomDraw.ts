// ────────────────────────────────────────────────────────────
// Random Draw 型別定義（Tarot / Lenormand / Runes / I Ching 共用的資料形狀）
//
// 核心原則：Randomness belongs to the application. Interpretation belongs to the LLM.
// 這裡的型別只描述「牌組長什麼樣子、抽出了什麼」，不放任何牌義／卦義解讀文字——
// 解讀永遠交給使用者自己貼去的外部 AI。
// ────────────────────────────────────────────────────────────

/** 使用者要準備／提供的輸入型態；一個系統可以同時有多種，代表混合型（Type E） */
export type InputMode =
  | "birthData" // Type A：Bazi, Vedic Astrology, Human Design...
  | "randomDraw" // Type B：Tarot, Lenormand, Runes, I Ching, Cartomancy...
  | "image" // Type C：Palmistry, Face Reading, Tasseography...
  | "text"; // Type D：Dream Divination, Bibliomancy...

/** 卡牌類（Tarot/Lenormand/Runes/Oracle/Cartomancy）共用同一套洗牌＋抽取策略 */
export type RandomizationMethod =
  | "tarot-card-draw"
  | "lenormand-card-draw"
  | "rune-draw"
  | "oracle-card-draw"
  | "cartomancy-draw"
  | "coin-toss-hexagram" // I Ching 專用（Phase 4），跟卡牌抽取邏輯完全不同
  | "geomantic-generation"; // 未來 Geomancy 用，這次不實作，先保留型別

export interface SpreadDefinition {
  id: string;
  name: string; // 例如 "Past / Present / Future"
  cardCount: number;
  positions: { index: number; label: string }[];
}

export interface DeckItem {
  id: string; // 例如 "major-00-fool"
  name: string; // "The Fool"（只存名稱，不存牌義解讀文字）
  arcana?: "major" | "minor"; // Tarot 專用
  suit?: string; // Tarot 小阿爾克那／Lenormand 用
  number?: number;
  /** 這張牌是否看正逆位；預設 true，個別牌可以在資料層覆寫成 false（例如對稱字形的符文） */
  reversible?: boolean;
  /** 選填：這個項目本身的文字符號（例如符文的 Unicode Runic 字符）。純文字，不是圖片，
   *  沒有版權疑慮；CardFace 有值時會優先顯示這個字符，取代通用幾何圖示。 */
  glyph?: string;
}

export interface DeckDefinition {
  id: string; // 例如 "rider-waite-tarot"
  name: string;
  itemCount: number; // 78 / 36 / 24...
  itemType: "card" | "rune" | "coin";
  supportsReversed: boolean;
  items: DeckItem[];
}

export interface RandomDrawConfig {
  randomizationMethod: RandomizationMethod;
  deckId: string; // 對應 DeckDefinition.id
  drawCounts: number[]; // 這個系統支援的抽牌張數，例如 [1, 3]
  spreads: SpreadDefinition[]; // 每種抽牌張數對應的牌陣位置
  allowRepeats: boolean; // 卡牌類一律 false（抽牌不放回）
  supportsReversed: boolean; // 是否有正逆位
  reversedProbability?: number; // 逆位機率，預設 0.5，資料層可調整，不寫死在程式碼裡
}

/** 單一張牌／符文的抽取結果 */
export interface DrawResult {
  itemId: string; // DeckItem.id
  itemName: string; // 抽當下的名稱快照，即使之後牌組資料改名也不影響歷史紀錄
  positionIndex: number; // 抽出的順序（0-based）
  positionLabel?: string; // 牌陣位置名稱，例如 "Past"
  reversed?: boolean; // 只有支援正逆位的牌組才有意義
}

/** 一次完整的抽牌／起卦結果，會被存進 Reading History，也會被送進 Prompt Generator */
export interface ReadingResult {
  method: RandomizationMethod;
  deckId?: string;
  deckName?: string;
  spreadId?: string;
  spreadName?: string;
  drawnAt: string; // ISO 字串
  results: DrawResult[];
}
