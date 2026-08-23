// ────────────────────────────────────────────────────────────
// Lenormand：36 張牌的名稱資料 ＋ 目前開放的牌陣
//
// 只放「牌名」，不放任何牌義解讀文字——解讀交給使用者自己貼去的外部 AI。
// 完全沿用 Phase 1（Tarot）建好的 Random Draw Engine 與畫面元件，這裡只是換一份
// DeckDefinition／SpreadDefinition。卡面沒有花色可對應，會落在 CardFace 的預設幾何圖示。
//
// 5 張的「直線陣」刻意不給每個位置固定語意標籤（不像塔羅的 Past/Present/Future）——
// 傳統雷諾曼卡讀法更看重「牌與牌之間的組合」而非固定位置的意義，所以位置只標示順序。
// ────────────────────────────────────────────────────────────
import type { DeckDefinition, DeckItem, SpreadDefinition } from "@/types/randomDraw";

const lenormandCardNames = [
  "Rider",
  "Clover",
  "Ship",
  "House",
  "Tree",
  "Clouds",
  "Snake",
  "Coffin",
  "Bouquet",
  "Scythe",
  "Whip",
  "Birds",
  "Child",
  "Fox",
  "Bear",
  "Stars",
  "Stork",
  "Dog",
  "Tower",
  "Garden",
  "Mountain",
  "Crossroads",
  "Mice",
  "Heart",
  "Ring",
  "Book",
  "Letter",
  "Man",
  "Woman",
  "Lily",
  "Sun",
  "Moon",
  "Key",
  "Fish",
  "Anchor",
  "Cross",
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildItems(): DeckItem[] {
  return lenormandCardNames.map((name, i) => ({
    id: `lenormand-${String(i + 1).padStart(2, "0")}-${slugify(name)}`,
    name,
    number: i + 1,
  }));
}

export const lenormandDeck: DeckDefinition = {
  id: "lenormand",
  name: "Lenormand",
  itemCount: 36,
  itemType: "card",
  supportsReversed: false, // 傳統雷諾曼卡讀法不看正逆位，只看牌與牌的組合
  items: buildItems(),
};

export const lenormandSpreads: SpreadDefinition[] = [
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
  {
    id: "five-card-line",
    name: "Five Card Line",
    cardCount: 5,
    positions: Array.from({ length: 5 }, (_, i) => ({ index: i, label: `Card ${i + 1}` })),
  },
];
