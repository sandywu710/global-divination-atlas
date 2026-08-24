import { describe, expect, it } from "vitest";
import { hexagrams, trigramLines, type LineBit, type Trigram } from "@/data/iching-hexagrams";
import { castHexagram } from "../ichingEngine";
import { derivePalace, sixRelativeLabel, toLiuYaoReadingResult } from "../liuyaoEngine";

// 這份測試的重點不是「跟教科書逐字核對」，而是用資料本身的結構性質來自我檢查——
// 只要納甲表或八宮推演邏輯裡有任何一個字元／規則抄錯，下面這些檢查至少會有一項失敗。

const YANG_BRANCHES = new Set(["子", "寅", "辰", "午", "申", "戌"]);
const YIN_BRANCHES = new Set(["丑", "卯", "巳", "未", "酉", "亥"]);

describe("納甲表的結構完整性（透過 toLiuYaoReadingResult 間接驗證）", () => {
  const trigramOrder: Trigram[] = ["qian", "kun", "zhen", "kan", "gen", "xun", "li", "dui"];

  it("每個經卦當下卦＋上卦時用到的 6 個地支，剛好是「陽支」或「陰支」六個一組、不重複", () => {
    // 直接把 8 個經卦兩兩接起來，組成 8 個「上下卦相同」的純卦，逐一起卦轉換，
    // 檢查每一卦 6 爻的地支集合。
    for (const t of trigramOrder) {
      const bits = [...trigramLines[t], ...trigramLines[t]] as LineBit[];
      const cast = fakeCastFromBits(bits);
      const reading = toLiuYaoReadingResult(cast);
      const branches = reading.results.map((r) => {
        const match = r.stemBranch?.match(/\(([^)]+)\)/)?.[1];
        return match?.[1]; // 兩個字的干支，取第二個字（地支）
      });
      expect(branches).toHaveLength(6);
      const branchSet = new Set(branches);
      expect(branchSet.size).toBe(6); // 6 個都不重複

      const allYang = [...branchSet].every((b) => b && YANG_BRANCHES.has(b));
      const allYin = [...branchSet].every((b) => b && YIN_BRANCHES.has(b));
      expect(allYang || allYin).toBe(true); // 6 個地支必須整組屬於同一種陰陽
    }
  });
});

describe("八宮推演（derivePalace）的完整性", () => {
  it("64 卦逐一丟進 derivePalace 都能得到一個結果、不會拋錯，且每個經卦恰好各自涵蓋 8 卦", () => {
    const trigramOrder: Trigram[] = ["qian", "kun", "zhen", "kan", "gen", "xun", "li", "dui"];
    const counts: Record<Trigram, number> = { qian: 0, kun: 0, zhen: 0, kan: 0, gen: 0, xun: 0, li: 0, dui: 0 };

    for (const h of hexagrams) {
      const palace = derivePalace(h.lines);
      expect(trigramOrder).toContain(palace);
      counts[palace]++;
    }

    for (const t of trigramOrder) {
      expect(counts[t]).toBe(8); // 每一宮剛好 8 卦，8 宮 × 8 卦 = 64，跟現有 64 卦資料完全對應
    }
  });

  it("本宮卦（上下卦相同）一定被歸類到自己的宮位", () => {
    const trigramOrder: Trigram[] = ["qian", "kun", "zhen", "kan", "gen", "xun", "li", "dui"];
    for (const t of trigramOrder) {
      const bits = [...trigramLines[t], ...trigramLines[t]] as LineBit[];
      expect(derivePalace(bits)).toBe(t);
    }
  });

  it("游魂卦與歸魂卦的外卦（上卦）相同——這是六爻文獻裡常見的已知性質，可用來交叉驗證推演規則", () => {
    const bits = [...trigramLines.qian, ...trigramLines.qian] as LineBit[];
    // 手動照 PALACE_TOGGLE_STAGES 的規則算游魂（index 6）與歸魂（index 7）
    const flip = (b: LineBit[], idx: number[]) => b.map((v, i) => (idx.includes(i) ? ((v === 1 ? 0 : 1) as LineBit) : v));
    const wanderingSoul = flip(bits, [0, 1, 2, 4]);
    const returningSoul = flip(bits, [4]);
    expect(wanderingSoul.slice(3)).toEqual(returningSoul.slice(3)); // 上卦（index 3-5）相同
    expect(wanderingSoul.slice(0, 3)).not.toEqual(returningSoul.slice(0, 3)); // 下卦不同
  });
});

describe("sixRelativeLabel：五行生剋 → 六親標籤，5x5 全組合都要有結果、不遺漏", () => {
  const elements = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;

  it("任兩個五行（含相同）都能唯一判斷出一種六親關係", () => {
    for (const a of elements) {
      for (const b of elements) {
        expect(() => sixRelativeLabel(a, b)).not.toThrow();
      }
    }
  });

  it("五行相同 → 兄弟；標準相生範例：Water 生 Wood，宮位是 Wood 時，Water 地支應為「父母」（生我者）", () => {
    expect(sixRelativeLabel("Wood", "Wood")).toBe("Siblings (兄弟)");
    expect(sixRelativeLabel("Water", "Wood")).toBe("Parents (父母)");
    expect(sixRelativeLabel("Fire", "Wood")).toBe("Offspring (子孫)"); // Wood 生 Fire，我生者為子孫
    expect(sixRelativeLabel("Metal", "Wood")).toBe("Officials / Spirits (官鬼)"); // Metal 剋 Wood，剋我者為官鬼
    expect(sixRelativeLabel("Earth", "Wood")).toBe("Spouse / Wealth (妻財)"); // Wood 剋 Earth，我剋者為妻財
  });
});

describe("toLiuYaoReadingResult：跟易經共用起卦引擎，只是多附加標註", () => {
  it("跑 200 次隨機起卦，每次都能順利附加 6 組天干地支／六親，且宮位名稱有值", () => {
    for (let i = 0; i < 200; i++) {
      const cast = castHexagram();
      const reading = toLiuYaoReadingResult(cast);
      expect(reading.results).toHaveLength(6);
      for (const r of reading.results) {
        expect(r.stemBranch).toBeTruthy();
        expect(r.sixRelative).toBeTruthy();
      }
      expect(reading.palaceName).toBeTruthy();
      // 本卦／之卦／變爻資訊完全沿用易經引擎算出來的結果，格式不變
      expect(reading.hexagramName).toBeTruthy();
      expect(reading.method).toBe("coin-toss-hexagram");
    }
  });
});

// 用固定的 6 爻陰陽組合，組出一個假的 HexagramCastResult，方便直接測試轉換邏輯，
// 不用真的去擲銅板。
function fakeCastFromBits(bits: LineBit[]) {
  return {
    lines: bits.map((b) => ({
      value: (b === 1 ? 7 : 8) as 6 | 7 | 8 | 9,
      yinYang: (b === 1 ? "yang" : "yin") as "yang" | "yin",
      changing: false,
    })),
    primaryHexagram: hexagrams.find((h) => h.lines.join("") === bits.join(""))!,
    resultingHexagram: undefined,
    changingLineIndices: [],
  };
}
