import { describe, expect, it } from "vitest";
import type { DeckDefinition, RandomDrawConfig, SpreadDefinition } from "@/types/randomDraw";
import { drawCards, DrawConfigError } from "../cardEngine";

function makeDeck(itemCount: number, overrides?: Partial<DeckDefinition>): DeckDefinition {
  return {
    id: "test-deck",
    name: "Test Deck",
    itemCount,
    itemType: "card",
    supportsReversed: true,
    items: Array.from({ length: itemCount }, (_, i) => ({ id: `item-${i}`, name: `Item ${i}` })),
    ...overrides,
  };
}

function makeSpread(cardCount: number, id = "spread"): SpreadDefinition {
  return {
    id,
    name: `${cardCount}-card spread`,
    cardCount,
    positions: Array.from({ length: cardCount }, (_, i) => ({ index: i, label: `Position ${i}` })),
  };
}

function makeConfig(overrides?: Partial<RandomDrawConfig>): RandomDrawConfig {
  return {
    randomizationMethod: "tarot-card-draw",
    deckId: "test-deck",
    drawCounts: [1, 3],
    spreads: [],
    allowRepeats: false,
    supportsReversed: true,
    ...overrides,
  };
}

describe("drawCards", () => {
  it("抽出的張數等於牌陣需要的張數，且沒有重複的牌", () => {
    const deck = makeDeck(78);
    const spread = makeSpread(3);
    const config = makeConfig();

    const result = drawCards(deck, spread, config);

    expect(result.results).toHaveLength(3);
    const ids = result.results.map((r) => r.itemId);
    expect(new Set(ids).size).toBe(3); // 不重複
  });

  it("每張牌依抽出順序對應正確的牌陣位置標籤", () => {
    const deck = makeDeck(78);
    const spread = makeSpread(3);
    spread.positions = [
      { index: 0, label: "Past" },
      { index: 1, label: "Present" },
      { index: 2, label: "Future" },
    ];
    const config = makeConfig();

    const result = drawCards(deck, spread, config);

    expect(result.results[0].positionIndex).toBe(0);
    expect(result.results[0].positionLabel).toBe("Past");
    expect(result.results[1].positionLabel).toBe("Present");
    expect(result.results[2].positionLabel).toBe("Future");
  });

  it("同一次抽牌，10,000 次重複測試都不會出現重複的牌", () => {
    const deck = makeDeck(78);
    const spread = makeSpread(3);
    const config = makeConfig();

    for (let i = 0; i < 10000; i++) {
      const result = drawCards(deck, spread, config);
      const ids = result.results.map((r) => r.itemId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("正逆位機率大致符合 reversedProbability 設定值", () => {
    const deck = makeDeck(78);
    const spread = makeSpread(1);
    const config = makeConfig({ drawCounts: [1], reversedProbability: 0.3 });

    let reversedCount = 0;
    const runs = 10000;
    for (let i = 0; i < runs; i++) {
      const result = drawCards(deck, spread, config);
      if (result.results[0].reversed) reversedCount++;
    }
    const ratio = reversedCount / runs;
    expect(ratio).toBeGreaterThan(0.25);
    expect(ratio).toBeLessThan(0.35);
  });

  it("supportsReversed 為 false 時，抽出的牌不應該有正逆位", () => {
    const deck = makeDeck(78, { supportsReversed: false });
    const spread = makeSpread(1);
    const config = makeConfig({ drawCounts: [1], supportsReversed: false });

    const result = drawCards(deck, spread, config);
    expect(result.results[0].reversed).toBeUndefined();
  });

  it("個別牌設定 reversible: false 時，即使系統支援正逆位，這張牌也不應該有正逆位", () => {
    const deck = makeDeck(1, { items: [{ id: "item-0", name: "Item 0", reversible: false }] });
    const spread = makeSpread(1);
    const config = makeConfig({ drawCounts: [1] });

    const result = drawCards(deck, spread, config);
    expect(result.results[0].reversed).toBeUndefined();
  });

  it("防呆：牌陣需要的張數超過牌組總數時，清楚拋出錯誤而不是讓程式當掉", () => {
    const deck = makeDeck(3);
    const spread = makeSpread(5); // 牌組只有 3 張，卻要抽 5 張
    const config = makeConfig({ drawCounts: [5] });

    expect(() => drawCards(deck, spread, config)).toThrow(DrawConfigError);
  });

  it("防呆：牌陣的 positions 數量跟 cardCount 對不上時拋出錯誤", () => {
    const deck = makeDeck(78);
    const spread = makeSpread(3);
    spread.positions = [{ index: 0, label: "Only one position" }]; // 故意設錯
    const config = makeConfig();

    expect(() => drawCards(deck, spread, config)).toThrow(DrawConfigError);
  });
});
