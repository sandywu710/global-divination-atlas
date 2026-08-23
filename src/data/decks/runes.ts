// ────────────────────────────────────────────────────────────
// Runes / Elder Futhark：24 個符文的名稱資料 ＋ 目前開放的抽取方式
//
// 只放「符文名稱」，不放任何符文含義解讀文字——解讀交給使用者自己貼去的外部 AI。
// 完全沿用 Phase 1（Tarot）建好的 Random Draw Engine 與畫面元件，只是換一份
// DeckDefinition／SpreadDefinition。
//
// reversible: false 標記的是傳統上被認為「字形對稱、翻轉後長得一樣，所以不看逆位」的符文
// （Gebo／Hagalaz／Isa／Jera／Ingwaz／Dagaz／Othala）——這是資料層的判斷，不是寫死在程式
// 邏輯裡；之後如果 Sandy 想依照別的流派調整哪些符文該有逆位，直接改這個檔案的
// reversible 欄位就好，不用碰任何 .ts 邏輯。
//
// 每個符文額外存了 glyph（Unicode Runic 字符本身），CardFace 會優先顯示這個字符
// 而不是通用幾何圖示——這是文字本身，不是圖片，沒有版權疑慮。
// ────────────────────────────────────────────────────────────
import type { DeckDefinition, DeckItem, SpreadDefinition } from "@/types/randomDraw";

interface RuneSeed {
  glyph: string;
  name: string;
  reversible?: boolean;
}

// 依傳統三個 Aett（Freyr's / Hagal's / Tyr's Aett）排列，共 24 個
const runeSeeds: RuneSeed[] = [
  { glyph: "ᚠ", name: "Fehu" },
  { glyph: "ᚢ", name: "Uruz" },
  { glyph: "ᚦ", name: "Thurisaz" },
  { glyph: "ᚨ", name: "Ansuz" },
  { glyph: "ᚱ", name: "Raidho" },
  { glyph: "ᚲ", name: "Kenaz" },
  { glyph: "ᚷ", name: "Gebo", reversible: false }, // 字形是對稱的 X，翻轉後一樣
  { glyph: "ᚹ", name: "Wunjo" },
  { glyph: "ᚺ", name: "Hagalaz", reversible: false },
  { glyph: "ᚾ", name: "Nauthiz" },
  { glyph: "ᛁ", name: "Isa", reversible: false }, // 一條直線，翻轉後一樣
  { glyph: "ᛃ", name: "Jera", reversible: false },
  { glyph: "ᛇ", name: "Eihwaz" },
  { glyph: "ᛈ", name: "Perthro" },
  { glyph: "ᛉ", name: "Algiz" },
  { glyph: "ᛊ", name: "Sowilo" },
  { glyph: "ᛏ", name: "Tiwaz" },
  { glyph: "ᛒ", name: "Berkano" },
  { glyph: "ᛖ", name: "Ehwaz" },
  { glyph: "ᛗ", name: "Mannaz" },
  { glyph: "ᛚ", name: "Laguz" },
  { glyph: "ᛜ", name: "Ingwaz", reversible: false },
  { glyph: "ᛞ", name: "Dagaz", reversible: false },
  { glyph: "ᛟ", name: "Othala", reversible: false },
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildItems(): DeckItem[] {
  return runeSeeds.map((seed, i) => ({
    id: `rune-${String(i + 1).padStart(2, "0")}-${slugify(seed.name)}`,
    name: seed.name,
    number: i + 1,
    reversible: seed.reversible,
    glyph: seed.glyph,
  }));
}

export const runesDeck: DeckDefinition = {
  id: "runes",
  name: "Elder Futhark Runes",
  itemCount: 24,
  itemType: "rune",
  supportsReversed: true,
  items: buildItems(),
};

export const runeSpreads: SpreadDefinition[] = [
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
