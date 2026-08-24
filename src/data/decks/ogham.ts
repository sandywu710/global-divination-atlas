// ────────────────────────────────────────────────────────────
// Ogham Divination：傳統 20 字母 Ogham 樹木字母表的名稱資料 ＋ 目前開放的抽取方式
//
// 只放「符號名稱」，不放任何象徵意義解讀文字——解讀交給使用者自己貼去的外部 AI。
// 完全沿用盧恩符文（Phase 1）已經做好的 Random Draw Engine 與畫面元件，這裡只是
// 換一份 DeckDefinition／SpreadDefinition，沒有新增或修改任何 .ts 邏輯。
//
// 20 個字母採用傳統的「四組（Aicme）各 5 個」順序，每個字母對應一種樹木，
// 這是最普遍被引用的 Ogham 占卜字母組合（不含後期擴充的 5 個 forfeda）。
//
// Unicode 本身有專門的 Ogham 字符區塊（U+1681 BEITH ～ U+1694 IODHADH，
// 剛好是連續 20 個字碼，順序跟傳統字母順序一致）。為了降低手動貼 20 個特殊字元
// 抄錯的風險，這裡不手動貼每一個符號，而是用起始碼位＋位移量算出來，
// __tests__ 會驗證算出來的 20 個符號彼此不重複、且都落在 Ogham 這個字符區塊裡。
// ────────────────────────────────────────────────────────────
import type { DeckDefinition, DeckItem, SpreadDefinition } from "@/types/randomDraw";

// Unicode Ogham 字符區塊：U+1681 OGHAM LETTER BEITH 是這 20 個字母的起始碼位
const OGHAM_BASE_CODEPOINT = 0x1681;

const oghamLetterNames = [
  // Aicme Beithe（第一組）
  "Beith",
  "Luis",
  "Fearn",
  "Sail",
  "Nion",
  // Aicme hÚatha（第二組）
  "Uath",
  "Duir",
  "Tinne",
  "Coll",
  "Ceirt",
  // Aicme Muine（第三組）
  "Muin",
  "Gort",
  "nGetal",
  "Straif",
  "Ruis",
  // Aicme Ailme（第四組）
  "Ailm",
  "Onn",
  "Ur",
  "Eadhadh",
  "Iodhadh",
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildItems(): DeckItem[] {
  return oghamLetterNames.map((name, i) => ({
    id: `ogham-${String(i + 1).padStart(2, "0")}-${slugify(name)}`,
    name,
    number: i + 1,
    glyph: String.fromCodePoint(OGHAM_BASE_CODEPOINT + i),
  }));
}

export const oghamDeck: DeckDefinition = {
  id: "ogham",
  name: "Ogham",
  itemCount: 20,
  itemType: "rune",
  supportsReversed: false, // Ogham 傳統上不像符文有明確的正逆位判讀慣例，故不啟用
  items: buildItems(),
};

export const oghamSpreads: SpreadDefinition[] = [
  {
    id: "quick-insight",
    name: "Quick Insight",
    cardCount: 1,
    positions: [{ index: 0, label: "Insight" }],
  },
  {
    id: "past-present-future",
    name: "Past / Present / Future",
    cardCount: 3,
    positions: [
      { index: 0, label: "Past" },
      { index: 1, label: "Present" },
      { index: 2, label: "Future" },
    ],
  },
];
