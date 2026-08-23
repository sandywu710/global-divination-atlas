import { describe, expect, it } from "vitest";
import { fisherYatesShuffle, rollReversed, secureRandomInt } from "../shuffle";

describe("fisherYatesShuffle", () => {
  it("回傳跟原陣列一樣長度、內容不重複也不遺漏的排列", () => {
    const input = Array.from({ length: 78 }, (_, i) => `card-${i}`);
    const shuffled = fisherYatesShuffle(input);

    expect(shuffled).toHaveLength(input.length);
    expect(new Set(shuffled).size).toBe(input.length); // 沒有重複
    expect([...shuffled].sort()).toEqual([...input].sort()); // 內容完全一樣，只是順序不同
  });

  it("不會修改傳入的原陣列", () => {
    const input = ["a", "b", "c"];
    const original = [...input];
    fisherYatesShuffle(input);
    expect(input).toEqual(original);
  });

  it("每張牌被洗到第一位的機率大致均等（10,000 次抽樣，無明顯偏誤）", () => {
    const deckSize = 78;
    const input = Array.from({ length: deckSize }, (_, i) => i);
    const runs = 10000;
    const firstPositionCounts = new Array(deckSize).fill(0);

    for (let i = 0; i < runs; i++) {
      const shuffled = fisherYatesShuffle(input);
      firstPositionCounts[shuffled[0]]++;
    }

    const expected = runs / deckSize; // 期望值 ≈ 128.2
    // 用寬鬆但足以抓出「明顯偏誤」的統計界線（約 ±6 個標準差），避免測試本身不穩定（flaky）
    const stdDev = Math.sqrt(runs * (1 / deckSize) * (1 - 1 / deckSize));
    const tolerance = stdDev * 6;

    for (const count of firstPositionCounts) {
      expect(count).toBeGreaterThan(expected - tolerance);
      expect(count).toBeLessThan(expected + tolerance);
    }
  });
});

describe("secureRandomInt", () => {
  it("回傳的整數永遠落在 [0, max) 範圍內", () => {
    for (let i = 0; i < 2000; i++) {
      const v = secureRandomInt(7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it("max 為 0 時回傳 0，不會拋錯", () => {
    expect(secureRandomInt(0)).toBe(0);
  });
});

describe("rollReversed", () => {
  it("預設機率大致符合 50/50（10,000 次抽樣）", () => {
    const runs = 10000;
    let reversedCount = 0;
    for (let i = 0; i < runs; i++) {
      if (rollReversed()) reversedCount++;
    }
    const ratio = reversedCount / runs;
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });

  it("機率大致符合資料層設定的自訂值（例如 0.2）", () => {
    const runs = 10000;
    let reversedCount = 0;
    for (let i = 0; i < runs; i++) {
      if (rollReversed(0.2)) reversedCount++;
    }
    const ratio = reversedCount / runs;
    expect(ratio).toBeGreaterThan(0.15);
    expect(ratio).toBeLessThan(0.25);
  });
});
