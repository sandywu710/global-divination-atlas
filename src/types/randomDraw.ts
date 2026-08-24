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

/** 卡牌類（Tarot/Lenormand/Runes/Oracle/Cartomancy）共用同一套洗牌＋抽取策略，
 *  刻意只列這 5 種、不包含 coin-toss-hexagram／object-toss，讓 RandomDrawConfig
 *  跟 CoinTossHexagramConfig／ObjectTossConfig 三者的 randomizationMethod 完全不重疊，
 *  TypeScript 才能在元件裡用 `randomizationMethod === "..."` 正確做型別窄化。 */
export type CardRandomizationMethod =
  | "tarot-card-draw"
  | "lenormand-card-draw"
  | "rune-draw"
  | "oracle-card-draw"
  | "cartomancy-draw";

export type RandomizationMethod =
  | CardRandomizationMethod
  | "coin-toss-hexagram" // I Ching／六爻專用，跟卡牌抽取邏輯完全不同
  | "object-toss" // Ifá／貝殼占卜／骨占共用：拋擲一組物件，記錄每一個正反面
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
  randomizationMethod: CardRandomizationMethod;
  deckId: string; // 對應 DeckDefinition.id
  drawCounts: number[]; // 這個系統支援的抽牌張數，例如 [1, 3]
  spreads: SpreadDefinition[]; // 每種抽牌張數對應的牌陣位置
  allowRepeats: boolean; // 卡牌類一律 false（抽牌不放回）
  supportsReversed: boolean; // 是否有正逆位
  reversedProbability?: number; // 逆位機率，預設 0.5，資料層可調整，不寫死在程式碼裡
}

/**
 * I Ching 專用設定：三枚銅板法起卦。跟卡牌類的 RandomDrawConfig 是完全不同的形狀
 * （沒有 deckId／spreads 這種概念），刻意不硬套卡牌類的型別。
 */
export interface CoinTossHexagramConfig {
  randomizationMethod: "coin-toss-hexagram";
  /** 銅板正面的計數值，傳統上是 3；放在資料層而不是寫死在程式邏輯裡 */
  headsValue: number;
  /** 銅板反面的計數值，傳統上是 2 */
  tailsValue: number;
}

/**
 * 拋擲類專用設定：Ifá／貝殼占卜／骨占共用。傳統做法都是「拋一組物件，
 * 記錄每一個是正面（marked）還是反面（unmarked）朝上」，邏輯上跟 I Ching 的
 * 三枚銅板法很接近（都是獨立擲、各自記正反面），但沒有「爻」「卦」這種
 * 疊加成更高層結構的概念，所以型別上刻意跟 CoinTossHexagramConfig 分開。
 */
export interface ObjectTossConfig {
  randomizationMethod: "object-toss";
  /** 這次要拋幾個物件，例如貝殼占卜傳統上常見的 16 枚 */
  objectCount: number;
  /** 物件本身的稱呼，例如 "cowrie shell"，用在畫面與 Prompt 的每一個位置標籤 */
  objectLabel: string;
  /** 正面（marked）朝上時要顯示的文字，例如 "Mouth-up (aperture visible)" */
  markedFaceLabel: string;
  /** 反面（unmarked）朝上時要顯示的文字，例如 "Mouth-down (back visible)" */
  unmarkedFaceLabel: string;
}

/**
 * 點陣類專用設定：非洲土占／西方土占共用。傳統做法是隨機產生 4 組「點陣」
 * （Mother 圖形，各由 4 條線組成，每條線是單點或雙點），再用固定規則機械式地
 * 推算出完整的 15 個圖形（Mothers／Daughters／Nieces／Witnesses／Judge）——
 * 後面這步完全是計算，不需要額外的隨機性，跟 I Ching 從變爻推出之卦是同一種
 * 「先隨機、再機械推算」的邏輯。沒有系統之間會不同的參數（兩個系統的圖形推算
 * 規則完全相同，差異只在 Prompt 文字怎麼引導 AI 解讀），所以這裡只是一個標記型別。
 */
export interface GeomancyConfig {
  randomizationMethod: "geomantic-generation";
}

/** DivinationSystem.randomDraw 可能是卡牌類設定、I Ching 的銅板法設定、拋擲類設定，或點陣類設定 */
export type AnyRandomDrawConfig = RandomDrawConfig | CoinTossHexagramConfig | ObjectTossConfig | GeomancyConfig;

/** 單一張牌／符文的抽取結果；I Ching 則用它來表示「單一爻」的起卦結果 */
export interface DrawResult {
  itemId: string; // DeckItem.id；I Ching 用 "line-1"~"line-6" 代表由下往上第幾爻
  itemName: string; // 抽當下的名稱快照，即使之後牌組資料改名也不影響歷史紀錄
  positionIndex: number; // 抽出的順序（0-based）；I Ching 是由下往上的爻位（0=最下面）
  positionLabel?: string; // 牌陣位置名稱，例如 "Past"；I Ching 用 "Line 1 (bottom)" 這種
  reversed?: boolean; // 只有支援正逆位的牌組才有意義
  /** 只有 I Ching 用：這一爻是否為變爻（老陰／老陽） */
  changing?: boolean;
  /** 只有六爻用：這一爻的天干地支（納甲），例如 "Jia-Zi (甲子)" */
  stemBranch?: string;
  /** 只有六爻用：這一爻的六親標註，例如 "Parents (父母)" */
  sixRelative?: string;
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
  // ── 以下只有 I Ching（coin-toss-hexagram）會用到 ──
  /** 本卦名稱，例如 "29. The Abysmal" */
  hexagramName?: string;
  /** 之卦名稱；只有存在變爻時才有 */
  resultingHexagramName?: string;
  /** 變爻的爻位（0-based，由下往上），沒有變爻時是空陣列 */
  changingLineIndices?: number[];
  /** 只有六爻用：這一卦所屬的京房八宮，例如 "Kan Palace (坎宮, Water)" */
  palaceName?: string;
}
