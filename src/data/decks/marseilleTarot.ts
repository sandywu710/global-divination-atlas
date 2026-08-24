// ────────────────────────────────────────────────────────────
// Marseille Tarot：78 張牌的名稱資料 ＋ 目前開放的牌陣
//
// 只放「牌名」，不放任何牌義解讀文字——解讀交給使用者自己貼去的外部 AI。
// 完全沿用萊德偉特塔羅（Phase 1）已經做好的 Random Draw Engine 與畫面元件，
// 這裡只是換一份 DeckDefinition／SpreadDefinition，沒有新增或修改任何 .ts 邏輯。
//
// Major Arcana（Atouts／王牌）用馬賽傳統的牌名（跟萊德偉特系統部分不同，例如
// "The Pope" 而不是 "The Hierophant"、"The Popess" 而不是 "The High Priestess"），
// 忠於馬賽塔羅自己的傳統，不是萊德偉特的英文名稱直接照抄。
//
// 花色沿用萊德偉特一樣的 4 個花色 id（wands/cups/swords/pentacles），只是為了
// 讓 CardFace.tsx 的花色圖示可以直接沿用（權杖形狀跟法棍很像、五角星形狀跟錢幣很像），
// 不用額外新增圖示邏輯；牌名文字本身用馬賽傳統的正確花色名稱（Batons／Coins）。
// ────────────────────────────────────────────────────────────
import type { DeckDefinition, DeckItem, SpreadDefinition } from "@/types/randomDraw";

const majorArcanaNames = [
  "The Fool",
  "The Magician",
  "The Popess",
  "The Empress",
  "The Emperor",
  "The Pope",
  "The Lovers",
  "The Chariot",
  "Justice",
  "The Hermit",
  "Wheel of Fortune",
  "Strength",
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

// 花色 id 沿用萊德偉特的 4 個（給 CardFace 圖示用），displayLabel 才是馬賽傳統的正確花色名稱
const minorSuits: { id: string; displayLabel: string }[] = [
  { id: "wands", displayLabel: "Batons" },
  { id: "cups", displayLabel: "Cups" },
  { id: "swords", displayLabel: "Swords" },
  { id: "pentacles", displayLabel: "Coins" },
];

const minorRankNames = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];

function buildMajorArcana(): DeckItem[] {
  return majorArcanaNames.map((name, i) => ({
    id: `marseille-major-${String(i).padStart(2, "0")}-${slugify(name)}`,
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
        id: `marseille-minor-${suit.id}-${slugify(rank)}`,
        name: `${rank} of ${suit.displayLabel}`,
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

export const marseilleTarotDeck: DeckDefinition = {
  id: "marseille-tarot",
  name: "Tarot de Marseille",
  itemCount: 78,
  itemType: "card",
  supportsReversed: true,
  items: [...buildMajorArcana(), ...buildMinorArcana()],
};

export const marseilleTarotSpreads: SpreadDefinition[] = [
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
