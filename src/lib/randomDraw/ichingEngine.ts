// ────────────────────────────────────────────────────────────
// I Ching 起卦引擎：三枚銅板法（3-coin method）
//
// 機制跟 cardEngine.ts 完全不同——不是「洗牌抽取」，是「由下往上擲 6 次，每次拋 3 枚銅板」，
// 所以刻意獨立成一個檔案，不硬塞進卡牌抽取邏輯裡。
//
// 重要：這裡的函式一樣完全不接收使用者的問題文字，起卦結果不受問題內容影響。
// ────────────────────────────────────────────────────────────
import { findHexagramByLines, type HexagramDefinition, type LineBit } from "@/data/iching-hexagrams";
import type { CoinTossHexagramConfig, DrawResult, ReadingResult } from "@/types/randomDraw";
import { coinFlipHeads } from "./shuffle";

export class HexagramLookupError extends Error {}

export const defaultCoinTossConfig: CoinTossHexagramConfig = {
  randomizationMethod: "coin-toss-hexagram",
  headsValue: 3,
  tailsValue: 2,
};

export type LineValue = 6 | 7 | 8 | 9;

export interface HexagramLine {
  value: LineValue;
  /** 這一爻本身是陰是陽（尚未套用變爻） */
  yinYang: "yin" | "yang";
  /** 是否為變爻（老陰／老陽） */
  changing: boolean;
}

/** 擲一次三枚銅板，回傳這一爻的結果。正面計 headsValue、反面計 tailsValue，三枚加總後判斷 6/7/8/9。 */
export function tossLine(config: CoinTossHexagramConfig = defaultCoinTossConfig): HexagramLine {
  let sum = 0;
  for (let i = 0; i < 3; i++) {
    sum += coinFlipHeads() ? config.headsValue : config.tailsValue;
  }

  switch (sum) {
    case 6:
      return { value: 6, yinYang: "yin", changing: true }; // 老陰：變爻，陰爻會變成陽爻
    case 7:
      return { value: 7, yinYang: "yang", changing: false }; // 少陽：不變
    case 8:
      return { value: 8, yinYang: "yin", changing: false }; // 少陰：不變
    case 9:
      return { value: 9, yinYang: "yang", changing: true }; // 老陽：變爻，陽爻會變成陰爻
    default:
      // 理論上不會發生（headsValue/tailsValue 若被改成不合理的值才可能），清楚拋錯而不是默默出錯
      throw new HexagramLookupError(`三枚銅板加總出現不合法的值：${sum}（正常只會是 6、7、8 或 9）。`);
  }
}

function lineToBit(line: HexagramLine): LineBit {
  return line.yinYang === "yang" ? 1 : 0;
}

export interface HexagramCastResult {
  /** 由下往上，共 6 爻 */
  lines: HexagramLine[];
  primaryHexagram: HexagramDefinition;
  /** 只有存在變爻時才有值 */
  resultingHexagram?: HexagramDefinition;
  /** 變爻的爻位（0-based，由下往上） */
  changingLineIndices: number[];
}

/** 依照已經擲好的 6 爻，查出本卦／之卦。跟 castHexagram() 分開，方便在 UI 逐爻擲完後才呼叫一次。 */
export function resolveHexagram(lines: HexagramLine[]): HexagramCastResult {
  if (lines.length !== 6) {
    throw new HexagramLookupError(`起卦需要剛好 6 爻，目前是 ${lines.length} 爻。`);
  }

  const primaryBits = lines.map(lineToBit);
  const primaryHexagram = findHexagramByLines(primaryBits);
  if (!primaryHexagram) {
    throw new HexagramLookupError("找不到對應的本卦，請確認 64 卦資料表（src/data/iching-hexagrams.ts）是否完整。");
  }

  const changingLineIndices = lines.reduce<number[]>((acc, line, i) => {
    if (line.changing) acc.push(i);
    return acc;
  }, []);

  let resultingHexagram: HexagramDefinition | undefined;
  if (changingLineIndices.length > 0) {
    const resultingBits = primaryBits.map((bit, i) => (lines[i].changing ? ((bit === 1 ? 0 : 1) as LineBit) : bit));
    resultingHexagram = findHexagramByLines(resultingBits);
    if (!resultingHexagram) {
      throw new HexagramLookupError("找不到對應的之卦，請確認 64 卦資料表是否完整。");
    }
  }

  return { lines, primaryHexagram, resultingHexagram, changingLineIndices };
}

/** 一次擲完 6 爻並直接算出本卦／之卦（給不需要逐爻互動的情境用，例如測試） */
export function castHexagram(config: CoinTossHexagramConfig = defaultCoinTossConfig): HexagramCastResult {
  const lines = Array.from({ length: 6 }, () => tossLine(config));
  return resolveHexagram(lines);
}

const lineLabels = ["Line 1 (bottom)", "Line 2", "Line 3", "Line 4", "Line 5", "Line 6 (top)"];
const lineValueLabels: Record<LineValue, string> = {
  6: "Old Yin (6, changing)",
  7: "Young Yang (7)",
  8: "Young Yin (8)",
  9: "Old Yang (9, changing)",
};

/** 把 HexagramCastResult 轉成跟卡牌類共用的 ReadingResult 形狀，讓歷史紀錄／Prompt 產生邏輯可以共用。 */
export function toReadingResult(cast: HexagramCastResult): ReadingResult {
  const results: DrawResult[] = cast.lines.map((line, i) => ({
    itemId: `line-${i + 1}`,
    itemName: lineValueLabels[line.value],
    positionIndex: i,
    positionLabel: lineLabels[i],
    changing: line.changing,
  }));

  return {
    method: "coin-toss-hexagram",
    drawnAt: new Date().toISOString(),
    results,
    hexagramName: `${cast.primaryHexagram.sequence}. ${cast.primaryHexagram.name}`,
    resultingHexagramName: cast.resultingHexagram
      ? `${cast.resultingHexagram.sequence}. ${cast.resultingHexagram.name}`
      : undefined,
    changingLineIndices: cast.changingLineIndices,
  };
}
