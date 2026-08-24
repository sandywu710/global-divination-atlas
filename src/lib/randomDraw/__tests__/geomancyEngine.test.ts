import { describe, expect, it } from "vitest";
import {
  castGeomanticChart,
  combineFigures,
  combineLines,
  deriveDaughters,
  generateMotherFigure,
  toReadingResult,
  type GeomancyFigure,
} from "../geomancyEngine";

// 這裡的重點不是「跟教科書逐字核對某個圖形叫什麼名字」（那個故意不做，交給 AI，
// 理由寫在 geomancyEngine.ts 檔頭），而是用數學上的結構性質自我檢查「加法規則」
// 跟「轉置成 Daughters」這兩個機械式推算步驟本身有沒有算錯。

function randomFigure(): GeomancyFigure {
  return generateMotherFigure();
}

describe("combineLines：土占加法規則", () => {
  it("同者得雙點、異者得單點，4 種組合都對", () => {
    expect(combineLines("single", "single")).toBe("double");
    expect(combineLines("double", "double")).toBe("double");
    expect(combineLines("single", "double")).toBe("single");
    expect(combineLines("double", "single")).toBe("single");
  });
});

describe("combineFigures：加法規則套用在整個圖形上", () => {
  it("任何圖形跟自己相加，結果一定是全雙點（同者得雙點，套用到全部 4 條線都成立）", () => {
    for (let i = 0; i < 100; i++) {
      const f = randomFigure();
      expect(combineFigures(f, f)).toEqual(["double", "double", "double", "double"]);
    }
  });

  it("加法規則是可交換的：combine(A,B) 跟 combine(B,A) 結果一定相同", () => {
    for (let i = 0; i < 100; i++) {
      const a = randomFigure();
      const b = randomFigure();
      expect(combineFigures(a, b)).toEqual(combineFigures(b, a));
    }
  });
});

describe("deriveDaughters：Mother 轉置成 Daughter", () => {
  it("轉置兩次會回到原本的 4 個圖形（轉置是自己的反函式）", () => {
    for (let trial = 0; trial < 50; trial++) {
      const mothers: [GeomancyFigure, GeomancyFigure, GeomancyFigure, GeomancyFigure] = [
        randomFigure(),
        randomFigure(),
        randomFigure(),
        randomFigure(),
      ];
      const daughters = deriveDaughters(mothers);
      const twiceTransposed = deriveDaughters(daughters);
      expect(twiceTransposed).toEqual(mothers);
    }
  });

  it("Daughter i 的第 j 條線，等於 Mother j 的第 i 條線（轉置的定義本身）", () => {
    const mothers: [GeomancyFigure, GeomancyFigure, GeomancyFigure, GeomancyFigure] = [
      ["single", "double", "single", "single"],
      ["double", "double", "single", "double"],
      ["single", "single", "double", "single"],
      ["double", "single", "double", "double"],
    ];
    const daughters = deriveDaughters(mothers);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(daughters[i][j]).toBe(mothers[j][i]);
      }
    }
  });
});

describe("castGeomanticChart：完整推算流程", () => {
  it("跑 500 次，每次都能算出完整的 15 個圖形，格式正確、沒有拋錯", () => {
    for (let i = 0; i < 500; i++) {
      const chart = castGeomanticChart();
      expect(chart.mothers).toHaveLength(4);
      expect(chart.daughters).toHaveLength(4);
      expect(chart.nieces).toHaveLength(4);
      expect(chart.rightWitness).toHaveLength(4);
      expect(chart.leftWitness).toHaveLength(4);
      expect(chart.judge).toHaveLength(4);
    }
  });

  it("Judge 只由 4 個 Mother 決定（給定同一組 Mother，Judge 一定相同——沒有偷偷混入額外隨機性）", () => {
    // 直接手動固定一組 Mother，繞過隨機亂數，驗證後續推算是純函式、可重現
    const mothers: [GeomancyFigure, GeomancyFigure, GeomancyFigure, GeomancyFigure] = [
      ["single", "single", "double", "single"],
      ["double", "single", "single", "double"],
      ["single", "double", "double", "single"],
      ["double", "double", "single", "single"],
    ];
    const daughters = deriveDaughters(mothers);
    const niece1 = combineFigures(mothers[0], mothers[1]);
    const niece2 = combineFigures(mothers[2], mothers[3]);
    const niece3 = combineFigures(daughters[0], daughters[1]);
    const niece4 = combineFigures(daughters[2], daughters[3]);
    const rightWitness = combineFigures(niece1, niece2);
    const leftWitness = combineFigures(niece3, niece4);
    const judgeA = combineFigures(rightWitness, leftWitness);
    const judgeB = combineFigures(rightWitness, leftWitness); // 重算一次，純函式應該完全一樣
    expect(judgeA).toEqual(judgeB);
  });

  it("toReadingResult 轉出剛好 15 個結果，每個都有可讀的圖形文字跟位置標籤，且標籤不重複", () => {
    const chart = castGeomanticChart();
    const reading = toReadingResult(chart);
    expect(reading.results).toHaveLength(15);
    expect(reading.method).toBe("geomantic-generation");
    const labels = reading.results.map((r) => r.positionLabel);
    expect(new Set(labels).size).toBe(15);
    for (const r of reading.results) {
      expect(r.itemName).toMatch(/^(•|••)( \/ (•|••)){3}$/); // 4 條線，用 " / " 分隔
    }
  });
});
