// ────────────────────────────────────────────────────────────
// Cartomancy（傳統撲克牌占卜）：標準 52 張撲克牌的名稱資料 ＋ 目前開放的牌陣
//
// 只放「牌名」，不放任何牌義解讀文字——解讀交給使用者自己貼去的外部 AI。
// 完全沿用萊德偉特塔羅（Phase 1）已經做好的 Random Draw Engine 與畫面元件，
// 這裡只是換一份 DeckDefinition／SpreadDefinition，沒有新增或修改任何 .ts 邏輯。
//
// 沒有 Major Arcana，就是單純的 4 花色 × 13 點數 = 52 張；傳統歐洲民俗占卜習慣上
// 只看正位（不像塔羅普遍會看逆位），所以 supportsReversed 設為 false，
// 跟雷諾曼卡的設計原則一致。
// ────────────────────────────────────────────────────────────
import type { DeckDefinition, DeckItem, SpreadDefinition } from "@/types/randomDraw";

const suits: { id: string; label: string }[] = [
  { id: "hearts", label: "Hearts" },
  { id: "diamonds", label: "Diamonds" },
  { id: "clubs", label: "Clubs" },
  { id: "spades", label: "Spades" },
];

const rankNames = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];

function buildItems(): DeckItem[] {
  const items: DeckItem[] = [];
  for (const suit of suits) {
    rankNames.forEach((rank, i) => {
      items.push({
        id: `cartomancy-${suit.id}-${slugify(rank)}`,
        name: `${rank} of ${suit.label}`,
        suit: suit.id,
        number: i + 1,
      });
    });
  }
  return items;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const cartomancyDeck: DeckDefinition = {
  id: "cartomancy",
  name: "Standard Playing Cards",
  itemCount: 52,
  itemType: "card",
  supportsReversed: false,
  items: buildItems(),
};

export const cartomancySpreads: SpreadDefinition[] = [
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
