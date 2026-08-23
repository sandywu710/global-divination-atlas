// ────────────────────────────────────────────────────────────
// I Ching 六十四卦對照表：卦名 ＋ 卦序 ＋ 六爻陰陽組合
//
// 只放「卦名與卦象結構」，不放任何卦辭／爻辭解讀文字——解讀交給使用者自己貼去的外部 AI。
//
// 為了降低手動輸入 64 組六位元陰陽組合時抄錯的風險，這裡不手動列出每一卦的六爻，
// 而是先給出 8 個經卦（trigram）各自的陰陽組合（這是很基礎、很容易驗證的資料），
// 每一卦只記錄「上卦＋下卦」是哪兩個經卦，六爻組合由程式自動算出來。
// __tests__ 裡有一個測試會驗證 64 卦的六爻組合彼此都不重複——如果不重複，
// 就代表 8×8=64 種上下卦組合剛好各出現一次，資料本身是自洽的。
//
// 卦序採用傳統的「周易／文王卦序」（King Wen sequence），卦名用英文通用譯名
// （例如 "The Creative"），避免中文卦名同音字造成混淆（例如卦 1 與卦 15 的拼音都是 Qian）。
// ────────────────────────────────────────────────────────────

export type Trigram = "qian" | "kun" | "zhen" | "kan" | "gen" | "xun" | "li" | "dui";

export type LineBit = 0 | 1; // 1 = 陽爻（實線）、0 = 陰爻（虛線）

/** 8 個經卦的陰陽組合，由下往上排列（index 0 = 最下面那一爻） */
export const trigramLines: Record<Trigram, [LineBit, LineBit, LineBit]> = {
  qian: [1, 1, 1], // 乾｜天
  kun: [0, 0, 0], // 坤｜地
  zhen: [1, 0, 0], // 震｜雷
  kan: [0, 1, 0], // 坎｜水
  gen: [0, 0, 1], // 艮｜山
  xun: [0, 1, 1], // 巽｜風
  li: [1, 0, 1], // 離｜火
  dui: [1, 1, 0], // 兌｜澤
};

export interface HexagramDefinition {
  /** King Wen 卦序，1-64 */
  sequence: number;
  /** 通用英文譯名，例如 "The Creative" */
  name: string;
  lowerTrigram: Trigram;
  upperTrigram: Trigram;
  /** 由下往上共 6 爻，1 = 陽爻、0 = 陰爻；由上下經卦資料算出，不手動輸入 */
  lines: [LineBit, LineBit, LineBit, LineBit, LineBit, LineBit];
}

function makeHexagram(sequence: number, name: string, lowerTrigram: Trigram, upperTrigram: Trigram): HexagramDefinition {
  const lower = trigramLines[lowerTrigram];
  const upper = trigramLines[upperTrigram];
  return {
    sequence,
    name,
    lowerTrigram,
    upperTrigram,
    lines: [lower[0], lower[1], lower[2], upper[0], upper[1], upper[2]],
  };
}

export const hexagrams: HexagramDefinition[] = [
  makeHexagram(1, "The Creative", "qian", "qian"),
  makeHexagram(2, "The Receptive", "kun", "kun"),
  makeHexagram(3, "Difficulty at the Beginning", "zhen", "kan"),
  makeHexagram(4, "Youthful Folly", "kan", "gen"),
  makeHexagram(5, "Waiting", "qian", "kan"),
  makeHexagram(6, "Conflict", "kan", "qian"),
  makeHexagram(7, "The Army", "kan", "kun"),
  makeHexagram(8, "Holding Together", "kun", "kan"),
  makeHexagram(9, "Small Taming", "qian", "xun"),
  makeHexagram(10, "Treading", "dui", "qian"),
  makeHexagram(11, "Peace", "qian", "kun"),
  makeHexagram(12, "Standstill", "kun", "qian"),
  makeHexagram(13, "Fellowship with Men", "li", "qian"),
  makeHexagram(14, "Great Possession", "qian", "li"),
  makeHexagram(15, "Modesty", "gen", "kun"),
  makeHexagram(16, "Enthusiasm", "kun", "zhen"),
  makeHexagram(17, "Following", "zhen", "dui"),
  makeHexagram(18, "Work on the Decayed", "xun", "gen"),
  makeHexagram(19, "Approach", "dui", "kun"),
  makeHexagram(20, "Contemplation", "kun", "xun"),
  makeHexagram(21, "Biting Through", "zhen", "li"),
  makeHexagram(22, "Grace", "li", "gen"),
  makeHexagram(23, "Splitting Apart", "kun", "gen"),
  makeHexagram(24, "Return", "zhen", "kun"),
  makeHexagram(25, "Innocence", "zhen", "qian"),
  makeHexagram(26, "Great Taming", "qian", "gen"),
  makeHexagram(27, "Nourishment", "zhen", "gen"),
  makeHexagram(28, "Great Preponderance", "xun", "dui"),
  makeHexagram(29, "The Abysmal", "kan", "kan"),
  makeHexagram(30, "The Clinging", "li", "li"),
  makeHexagram(31, "Influence", "gen", "dui"),
  makeHexagram(32, "Duration", "xun", "zhen"),
  makeHexagram(33, "Retreat", "gen", "qian"),
  makeHexagram(34, "Great Power", "qian", "zhen"),
  makeHexagram(35, "Progress", "kun", "li"),
  makeHexagram(36, "Darkening of the Light", "li", "kun"),
  makeHexagram(37, "The Family", "li", "xun"),
  makeHexagram(38, "Opposition", "dui", "li"),
  makeHexagram(39, "Obstruction", "gen", "kan"),
  makeHexagram(40, "Deliverance", "kan", "zhen"),
  makeHexagram(41, "Decrease", "dui", "gen"),
  makeHexagram(42, "Increase", "zhen", "xun"),
  makeHexagram(43, "Breakthrough", "qian", "dui"),
  makeHexagram(44, "Coming to Meet", "xun", "qian"),
  makeHexagram(45, "Gathering Together", "kun", "dui"),
  makeHexagram(46, "Pushing Upward", "xun", "kun"),
  makeHexagram(47, "Oppression", "kan", "dui"),
  makeHexagram(48, "The Well", "xun", "kan"),
  makeHexagram(49, "Revolution", "li", "dui"),
  makeHexagram(50, "The Cauldron", "xun", "li"),
  makeHexagram(51, "The Arousing", "zhen", "zhen"),
  makeHexagram(52, "Keeping Still", "gen", "gen"),
  makeHexagram(53, "Development", "gen", "xun"),
  makeHexagram(54, "The Marrying Maiden", "dui", "zhen"),
  makeHexagram(55, "Abundance", "li", "zhen"),
  makeHexagram(56, "The Wanderer", "gen", "li"),
  makeHexagram(57, "The Gentle", "xun", "xun"),
  makeHexagram(58, "The Joyous", "dui", "dui"),
  makeHexagram(59, "Dispersion", "kan", "xun"),
  makeHexagram(60, "Limitation", "dui", "kan"),
  makeHexagram(61, "Inner Truth", "dui", "xun"),
  makeHexagram(62, "Small Preponderance", "gen", "zhen"),
  makeHexagram(63, "After Completion", "li", "kan"),
  makeHexagram(64, "Before Completion", "kan", "li"),
];

export function findHexagramByLines(lines: readonly LineBit[]): HexagramDefinition | undefined {
  return hexagrams.find((h) => h.lines.every((bit, i) => bit === lines[i]));
}

export function getHexagramBySequence(sequence: number): HexagramDefinition | undefined {
  return hexagrams.find((h) => h.sequence === sequence);
}
