import { describe, expect, it } from "vitest";
import { hexagrams } from "@/data/iching-hexagrams";
import { castHexagram, defaultCoinTossConfig, HexagramLookupError, resolveHexagram, tossLine } from "../ichingEngine";
import type { HexagramLine } from "../ichingEngine";

describe("64 卦資料表本身的完整性", () => {
  it("剛好有 64 卦，卦序 1-64 各出現一次", () => {
    expect(hexagrams).toHaveLength(64);
    const sequences = hexagrams.map((h) => h.sequence).sort((a, b) => a - b);
    expect(sequences).toEqual(Array.from({ length: 64 }, (_, i) => i + 1));
  });

  it("64 卦的六爻組合彼此都不重複（代表 8x8 種上下卦組合剛好各出現一次，資料自洽）", () => {
    const patterns = hexagrams.map((h) => h.lines.join(""));
    expect(new Set(patterns).size).toBe(64);
  });

  it("乾卦（全陽）跟坤卦（全陰）的卦序符合傳統認知（1 跟 2）", () => {
    const allYang = hexagrams.find((h) => h.lines.every((l) => l === 1));
    const allYin = hexagrams.find((h) => h.lines.every((l) => l === 0));
    expect(allYang?.sequence).toBe(1);
    expect(allYin?.sequence).toBe(2);
  });
});

describe("tossLine：三枚銅板法的 6/7/8/9 判斷", () => {
  it("回傳值只會是 6、7、8、9 其中一種，且陰陽／變爻判斷正確", () => {
    for (let i = 0; i < 2000; i++) {
      const line = tossLine();
      expect([6, 7, 8, 9]).toContain(line.value);
      if (line.value === 6) expect(line).toMatchObject({ yinYang: "yin", changing: true }); // 老陰
      if (line.value === 7) expect(line).toMatchObject({ yinYang: "yang", changing: false }); // 少陽
      if (line.value === 8) expect(line).toMatchObject({ yinYang: "yin", changing: false }); // 少陰
      if (line.value === 9) expect(line).toMatchObject({ yinYang: "yang", changing: true }); // 老陽
    }
  });

  it("加總不合法時（例如自訂了奇怪的銅板計數值）會清楚拋出錯誤，而不是默默壞掉", () => {
    // headsValue=100、tailsValue=1 時，三枚銅板無論正反面組合，加總都不可能落在 {6,7,8,9}
    // （最小 3、最大 300），保證一定會觸發錯誤處理路徑，測試才不會因為隨機結果而不穩定
    expect(() =>
      tossLine({ randomizationMethod: "coin-toss-hexagram", headsValue: 100, tailsValue: 1 })
    ).toThrow(HexagramLookupError);
  });

  it("三枚銅板加總的機率分布大致符合傳統的 1/8、3/8、3/8、1/8（老陰/少陽/少陰/老陽，10,000 次抽樣）", () => {
    const runs = 10000;
    const counts: Record<number, number> = { 6: 0, 7: 0, 8: 0, 9: 0 };
    for (let i = 0; i < runs; i++) {
      counts[tossLine().value]++;
    }
    // 老陰(6)／老陽(9) 期望值約 1250（1/8），少陽(7)／少陰(8) 期望值約 3750（3/8）
    expect(counts[6]).toBeGreaterThan(1000);
    expect(counts[6]).toBeLessThan(1550);
    expect(counts[9]).toBeGreaterThan(1000);
    expect(counts[9]).toBeLessThan(1550);
    expect(counts[7]).toBeGreaterThan(3400);
    expect(counts[7]).toBeLessThan(4100);
    expect(counts[8]).toBeGreaterThan(3400);
    expect(counts[8]).toBeLessThan(4100);
  });
});

describe("resolveHexagram：本卦／之卦與變爻換算", () => {
  function line(value: 6 | 7 | 8 | 9): HexagramLine {
    const yinYang = value === 7 || value === 9 ? "yang" : "yin";
    const changing = value === 6 || value === 9;
    return { value, yinYang, changing };
  }

  it("沒有變爻時，只有本卦，沒有之卦", () => {
    // 全部少陽（7）：本卦是全陽的乾卦，沒有變爻
    const lines = Array.from({ length: 6 }, () => line(7));
    const result = resolveHexagram(lines);
    expect(result.primaryHexagram.sequence).toBe(1); // 乾
    expect(result.resultingHexagram).toBeUndefined();
    expect(result.changingLineIndices).toEqual([]);
  });

  it("有變爻時，之卦是把變爻的陰陽對調後查出來的卦", () => {
    // 6 個少陰（8，陰不變）以外，第一爻用老陽（9，變爻：陽會變成陰）
    // 全陰的坤卦（8,8,8,8,8,8）中，把最下面那一爻從陰變陽 → 應該變成「復卦」（一陽在下，其餘皆陰）
    const lines: HexagramLine[] = [line(9), line(8), line(8), line(8), line(8), line(8)];
    const result = resolveHexagram(lines);
    expect(result.primaryHexagram.sequence).toBe(24); // Return（復卦：初爻陽、其餘皆陰）
    expect(result.changingLineIndices).toEqual([0]);
    expect(result.resultingHexagram?.sequence).toBe(2); // 變爻後底下那一爻由陽轉陰 → 全陰坤卦
  });

  it("爻數不是 6 的時候會清楚拋出錯誤", () => {
    expect(() => resolveHexagram([line(7), line(7)])).toThrow(HexagramLookupError);
  });
});

describe("castHexagram：完整起卦流程", () => {
  it("回傳 6 爻、一定有本卦，變爻爻位跟 changing 標記一致", () => {
    for (let i = 0; i < 200; i++) {
      const result = castHexagram(defaultCoinTossConfig);
      expect(result.lines).toHaveLength(6);
      expect(result.primaryHexagram).toBeDefined();
      const changingFromLines = result.lines.reduce<number[]>((acc, l, idx) => {
        if (l.changing) acc.push(idx);
        return acc;
      }, []);
      expect(result.changingLineIndices).toEqual(changingFromLines);
      if (changingFromLines.length > 0) {
        expect(result.resultingHexagram).toBeDefined();
      } else {
        expect(result.resultingHexagram).toBeUndefined();
      }
    }
  });
});
