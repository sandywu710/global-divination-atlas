// ────────────────────────────────────────────────────────────
// Thoth Tarot：78 張牌的名稱資料 ＋ 目前開放的牌陣
//
// 只放「牌名」，不放任何牌義解讀文字——解讀交給使用者自己貼去的外部 AI。
// 完全沿用萊德偉特塔羅（Phase 1）已經做好的 Random Draw Engine 與畫面元件，
// 這裡只是換一份 DeckDefinition／SpreadDefinition，沒有新增或修改任何 .ts 邏輯。
//
// Major Arcana 用 Crowley 設計托特塔羅時實際改過的牌名，這是托特塔羅最明顯的
// 特徵之一（跟萊德偉特不是同一套名稱）：
//   - VIII 從 Justice 改成 Adjustment，XI 從 Strength 改成 Lust（兩張牌的卦序互換）
//   - XIV Temperance 改名 Art，XX Judgement 改名 The Aeon，XXI The World 改名 The Universe
//
// 小阿爾克那的花色是 Wands／Cups／Swords／Disks（不是萊德偉特的 Pentacles），
// 宮廷牌是 Knight／Queen／Prince／Princess 四階（不是萊德偉特的 Page／Knight／Queen／King），
// 這也是托特塔羅相當知名、經常被提到的特徵。
//
// 花色 id 沿用萊德偉特的 pentacles（給 CardFace 圖示用，Disk 本身視覺上就是圓形，
// 跟現有的 pentacles 圖示相近），displayLabel 才是托特傳統的正確花色名稱 "Disks"。
// ────────────────────────────────────────────────────────────
import type { DeckDefinition, DeckItem, SpreadDefinition } from "@/types/randomDraw";

const majorArcanaNames = [
  "The Fool",
  "The Magus",
  "The Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Adjustment",
  "The Hermit",
  "Fortune",
  "Lust",
  "The Hanged Man",
  "Death",
  "Art",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "The Aeon",
  "The Universe",
];

// 花色 id 沿用萊德偉特的 pentacles（給 CardFace 圖示用），displayLabel 才是托特傳統的正確花色名稱
const minorSuits: { id: string; displayLabel: string }[] = [
  { id: "wands", displayLabel: "Wands" },
  { id: "cups", displayLabel: "Cups" },
  { id: "swords", displayLabel: "Swords" },
  { id: "pentacles", displayLabel: "Disks" },
];

const minorRankNames = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
// 托特塔羅的宮廷牌是四階 Knight／Queen／Prince／Princess，不是萊德偉特的 Page／Knight／Queen／King
const courtNames = ["Knight", "Queen", "Prince", "Princess"];

function buildMajorArcana(): DeckItem[] {
  return majorArcanaNames.map((name, i) => ({
    id: `thoth-major-${String(i).padStart(2, "0")}-${slugify(name)}`,
    name,
    arcana: "major",
    number: i,
  }));
}

function buildMinorArcana(): DeckItem[] {
  const items: DeckItem[] = [];
  for (const suit of minorSuits) {
    const ranks = [...minorRankNames, ...courtNames];
    ranks.forEach((rank, i) => {
      items.push({
        id: `thoth-minor-${suit.id}-${slugify(rank)}`,
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

export const thothTarotDeck: DeckDefinition = {
  id: "thoth-tarot",
  name: "Thoth Tarot",
  itemCount: 78,
  itemType: "card",
  supportsReversed: true,
  items: [...buildMajorArcana(), ...buildMinorArcana()],
};

export const thothTarotSpreads: SpreadDefinition[] = [
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
