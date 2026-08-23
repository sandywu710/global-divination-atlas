// ────────────────────────────────────────────────────────────
// Rider-Waite-Smith Tarot：78 張牌的名稱資料 ＋ 目前開放的牌陣
//
// 只放「牌名」，不放任何牌義解讀文字——解讀交給使用者自己貼去的外部 AI。
// 卡面呈現用文字＋原創幾何圖示（見 src/components/draw/CardFace.tsx），
// 不使用市售彩色插畫掃描檔（版權考量）。
//
// 想加新牌陣：在 spreads 陣列加一筆 SpreadDefinition，並把它的 cardCount
// 加進 randomDraw.drawCounts（在 src/data/systems.ts 的 rider-waite-tarot 那筆）。
// Situation/Challenge/Advice 跟 5 張陣型的資料先不建立，等之後要開放時再補。
// ────────────────────────────────────────────────────────────
import type { DeckDefinition, DeckItem, SpreadDefinition } from "@/types/randomDraw";

const majorArcanaNames = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];

const minorSuits: { id: string; label: string }[] = [
  { id: "wands", label: "Wands" },
  { id: "cups", label: "Cups" },
  { id: "swords", label: "Swords" },
  { id: "pentacles", label: "Pentacles" },
];

const minorRankNames = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];

function buildMajorArcana(): DeckItem[] {
  return majorArcanaNames.map((name, i) => ({
    id: `major-${String(i).padStart(2, "0")}-${slugify(name)}`,
    name,
    arcana: "major",
    number: i,
  }));
}

function buildMinorArcana(): DeckItem[] {
  const items: DeckItem[] = [];
  for (const suit of minorSuits) {
    minorRankNames.forEach((rank, i) => {
      items.push({
        id: `minor-${suit.id}-${slugify(rank)}`,
        name: `${rank} of ${suit.label}`,
        arcana: "minor",
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

export const riderWaiteTarotDeck: DeckDefinition = {
  id: "rider-waite-tarot",
  name: "Rider-Waite-Smith Tarot",
  itemCount: 78,
  itemType: "card",
  supportsReversed: true,
  items: [...buildMajorArcana(), ...buildMinorArcana()],
};

export const tarotSpreads: SpreadDefinition[] = [
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
