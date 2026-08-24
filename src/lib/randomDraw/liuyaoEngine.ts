// ────────────────────────────────────────────────────────────
// 六爻起卦引擎
//
// 起卦本身（三枚銅板法、由下往上擲 6 次）完全沿用易經的邏輯——
// tossLine／resolveHexagram／toReadingResult 都直接從 ichingEngine.ts 匯入，
// 不重寫、不複製、也完全不修改那個檔案。這裡只新增六爻獨有的標註層：
// 天干地支（納甲）與六親。
//
// 刻意不在這裡計算的部分（交給 Prompt 裡的 AI 處理，理由寫在下面）：
//
// 「六神」的起法需要知道起卦當天的天干（例如甲乙日起青龍……），而從西元日期
// 反推當天的干支需要一個精確的萬年曆演算法起點——這個起點如果記錯，結果會
// 悄悄地錯，而且光靠程式內部的邏輯一致性測試完全抓不出來（不像下面的納甲表、
// 八宮表，可以用結構性質自我檢查）。所以這裡不自己算，而是把「起卦當下的
// 日期」跟「六神的排法規則」都寫清楚放進 Prompt，交給 AI 用它自己更可靠的
// 萬年曆知識去換算當天日干、排六神——這不是「叫 AI 自己編造隨機結果」，
// 是「把一個純日期換算的機械性步驟交給比較擅長的一方」。
//
// 「用神」的判斷本質上需要理解這次問題在問什麼（問財看妻財、問工作看官鬼……），
// 這是解讀，不是起卦，所以依照專案一貫的原則（隨機性歸網站、解讀歸 AI）交給 AI，
// Prompt 裡會明確指示怎麼利用這裡已經標好的六親標籤去判斷用神。
// ────────────────────────────────────────────────────────────
import { trigramLines, type LineBit, type Trigram } from "@/data/iching-hexagrams";
import type { DrawResult, ReadingResult } from "@/types/randomDraw";
import { toReadingResult, type HexagramCastResult } from "./ichingEngine";

type Element = "Wood" | "Fire" | "Earth" | "Metal" | "Water";

interface NajiaEntry {
  /** 顯示用文字，例如 "Jia-Zi (甲子)" */
  label: string;
  /** 地支本身（單一中文字），用來查五行 */
  branch: string;
}

/**
 * 8 個經卦的納甲（裝卦）對照表：lower 是這個經卦當「下卦」時，由下往上 3 爻的干支；
 * upper 是當「上卦」時的 3 爻干支。這是六爻占卜最標準、最普遍引用的納甲表（京房易／火珠林系統）。
 *
 * 這份表有沒有抄錯，用結構性質自我檢查（見 __tests__/liuyaoEngine.test.ts）：
 * 每個經卦用到的 6 個地支，剛好是「陽支（子寅辰午申戌）」或「陰支（丑卯巳未酉亥）」
 * 其中一組、6 個各出現一次、不重複——這個性質只要抄錯任何一個字就會被抓到。
 */
const NAJIA_TABLE: Record<Trigram, { lower: [NajiaEntry, NajiaEntry, NajiaEntry]; upper: [NajiaEntry, NajiaEntry, NajiaEntry] }> = {
  qian: {
    lower: [
      { label: "Jia-Zi (甲子)", branch: "子" },
      { label: "Jia-Yin (甲寅)", branch: "寅" },
      { label: "Jia-Chen (甲辰)", branch: "辰" },
    ],
    upper: [
      { label: "Ren-Wu (壬午)", branch: "午" },
      { label: "Ren-Shen (壬申)", branch: "申" },
      { label: "Ren-Xu (壬戌)", branch: "戌" },
    ],
  },
  kun: {
    lower: [
      { label: "Yi-Wei (乙未)", branch: "未" },
      { label: "Yi-Si (乙巳)", branch: "巳" },
      { label: "Yi-Mao (乙卯)", branch: "卯" },
    ],
    upper: [
      { label: "Gui-Chou (癸丑)", branch: "丑" },
      { label: "Gui-Hai (癸亥)", branch: "亥" },
      { label: "Gui-You (癸酉)", branch: "酉" },
    ],
  },
  zhen: {
    lower: [
      { label: "Geng-Zi (庚子)", branch: "子" },
      { label: "Geng-Yin (庚寅)", branch: "寅" },
      { label: "Geng-Chen (庚辰)", branch: "辰" },
    ],
    upper: [
      { label: "Geng-Wu (庚午)", branch: "午" },
      { label: "Geng-Shen (庚申)", branch: "申" },
      { label: "Geng-Xu (庚戌)", branch: "戌" },
    ],
  },
  xun: {
    lower: [
      { label: "Xin-Chou (辛丑)", branch: "丑" },
      { label: "Xin-Hai (辛亥)", branch: "亥" },
      { label: "Xin-You (辛酉)", branch: "酉" },
    ],
    upper: [
      { label: "Xin-Wei (辛未)", branch: "未" },
      { label: "Xin-Si (辛巳)", branch: "巳" },
      { label: "Xin-Mao (辛卯)", branch: "卯" },
    ],
  },
  kan: {
    lower: [
      { label: "Wu-Yin (戊寅)", branch: "寅" },
      { label: "Wu-Chen (戊辰)", branch: "辰" },
      { label: "Wu-Wu (戊午)", branch: "午" },
    ],
    upper: [
      { label: "Wu-Shen (戊申)", branch: "申" },
      { label: "Wu-Xu (戊戌)", branch: "戌" },
      { label: "Wu-Zi (戊子)", branch: "子" },
    ],
  },
  li: {
    lower: [
      { label: "Ji-Mao (己卯)", branch: "卯" },
      { label: "Ji-Chou (己丑)", branch: "丑" },
      { label: "Ji-Hai (己亥)", branch: "亥" },
    ],
    upper: [
      { label: "Ji-You (己酉)", branch: "酉" },
      { label: "Ji-Wei (己未)", branch: "未" },
      { label: "Ji-Si (己巳)", branch: "巳" },
    ],
  },
  gen: {
    lower: [
      { label: "Bing-Chen (丙辰)", branch: "辰" },
      { label: "Bing-Wu (丙午)", branch: "午" },
      { label: "Bing-Shen (丙申)", branch: "申" },
    ],
    upper: [
      { label: "Bing-Xu (丙戌)", branch: "戌" },
      { label: "Bing-Zi (丙子)", branch: "子" },
      { label: "Bing-Yin (丙寅)", branch: "寅" },
    ],
  },
  dui: {
    lower: [
      { label: "Ding-Si (丁巳)", branch: "巳" },
      { label: "Ding-Mao (丁卯)", branch: "卯" },
      { label: "Ding-Chou (丁丑)", branch: "丑" },
    ],
    upper: [
      { label: "Ding-Hai (丁亥)", branch: "亥" },
      { label: "Ding-You (丁酉)", branch: "酉" },
      { label: "Ding-Wei (丁未)", branch: "未" },
    ],
  },
};

/** 12 地支的五行，基礎、固定對照表 */
const BRANCH_ELEMENT: Record<string, Element> = {
  子: "Water",
  丑: "Earth",
  寅: "Wood",
  卯: "Wood",
  辰: "Earth",
  巳: "Fire",
  午: "Fire",
  未: "Earth",
  申: "Metal",
  酉: "Metal",
  戌: "Earth",
  亥: "Water",
};

/** 8 個經卦（八宮）各自的五行 */
const PALACE_ELEMENT: Record<Trigram, Element> = {
  qian: "Metal",
  dui: "Metal",
  zhen: "Wood",
  xun: "Wood",
  kan: "Water",
  li: "Fire",
  gen: "Earth",
  kun: "Earth",
};

const PALACE_LABEL: Record<Trigram, string> = {
  qian: "Qian",
  kun: "Kun",
  zhen: "Zhen",
  xun: "Xun",
  kan: "Kan",
  li: "Li",
  gen: "Gen",
  dui: "Dui",
};

const trigramOrder: Trigram[] = ["qian", "kun", "zhen", "kan", "gen", "xun", "li", "dui"];

/**
 * 京房易「八宮卦」的世爻推演規則：從本宮（純卦，上下卦相同）開始，
 * 依序推出一世卦～五世卦、游魂卦、歸魂卦，這 8 個階段各自跟本宮差在哪幾爻
 * （0-based，0 = 最下面那一爻）。
 *
 * 這裡故意不用手動列出「64 卦分別屬於哪一宮」的表（那張表如果背錯很難自己
 * 發現），而是直接用這個推演規則，從 8 個本宮各自算出屬於它的 8 卦，
 * 讓 __tests__/liuyaoEngine.test.ts 驗證「8 宮 × 8 卦＝64 卦，剛好跟
 * iching-hexagrams.ts 裡現有的 64 卦一一對應、沒有重複也沒有遺漏」——
 * 這是比手動核對更可靠的自我檢查方式。
 */
const PALACE_TOGGLE_STAGES: readonly number[][] = [
  [], // 本宮
  [0], // 一世
  [0, 1], // 二世
  [0, 1, 2], // 三世
  [0, 1, 2, 3], // 四世
  [0, 1, 2, 3, 4], // 五世
  [0, 1, 2, 4], // 游魂（五世卦的第 4 爻變回本卦）
  [4], // 歸魂（游魂卦的下卦三爻全部變回本卦，只留第 5 爻跟本宮不同）
];

function flipBits(bits: readonly LineBit[], toggleIndices: readonly number[]): LineBit[] {
  return bits.map((b, i) => (toggleIndices.includes(i) ? ((b === 1 ? 0 : 1) as LineBit) : b));
}

function bitsEqual(a: readonly LineBit[], b: readonly LineBit[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** 由 3 個爻的陰陽組合，反查是哪一個經卦 */
function findTrigramByBits(bits: readonly [LineBit, LineBit, LineBit]): Trigram {
  const found = trigramOrder.find((t) => bitsEqual(trigramLines[t], bits));
  if (!found) throw new Error(`找不到對應的經卦：${bits.join("")}（不應該發生，除非 trigramLines 資料被改壞）`);
  return found;
}

/** 由完整 6 爻的陰陽組合，推出這一卦屬於哪一宮（京房八宮） */
export function derivePalace(bits: readonly LineBit[]): Trigram {
  for (const palace of trigramOrder) {
    const pure = [...trigramLines[palace], ...trigramLines[palace]];
    for (const stage of PALACE_TOGGLE_STAGES) {
      if (bitsEqual(flipBits(pure, stage), bits)) return palace;
    }
  }
  throw new Error("找不到對應的宮位，八宮卦推演資料可能有誤（不應該發生）。");
}

function elementGenerates(a: Element, b: Element): boolean {
  const next: Record<Element, Element> = { Wood: "Fire", Fire: "Earth", Earth: "Metal", Metal: "Water", Water: "Wood" };
  return next[a] === b;
}

function elementOvercomes(a: Element, b: Element): boolean {
  const next: Record<Element, Element> = { Wood: "Earth", Earth: "Water", Water: "Fire", Fire: "Metal", Metal: "Wood" };
  return next[a] === b;
}

/** 依「宮位五行」與「這一爻地支的五行」的生剋關係，判斷這一爻的六親標籤 */
export function sixRelativeLabel(branchElement: Element, palaceElement: Element): string {
  if (branchElement === palaceElement) return "Siblings (兄弟)";
  if (elementGenerates(palaceElement, branchElement)) return "Offspring (子孫)"; // 我生者為子孫
  if (elementGenerates(branchElement, palaceElement)) return "Parents (父母)"; // 生我者為父母
  if (elementOvercomes(palaceElement, branchElement)) return "Spouse / Wealth (妻財)"; // 我剋者為妻財
  if (elementOvercomes(branchElement, palaceElement)) return "Officials / Spirits (官鬼)"; // 剋我者為官鬼
  throw new Error(`無法判斷六親關係：${branchElement} vs ${palaceElement}（不應該發生）。`);
}

/**
 * 把易經起卦引擎算出來的 HexagramCastResult，轉成六爻專用的 ReadingResult——
 * 先呼叫沒有修改過的 toReadingResult() 拿到跟易經完全相同格式的基礎結果，
 * 再多附加每一爻的天干地支（納甲）與六親標註、還有這一卦所屬的宮位。
 */
export function toLiuYaoReadingResult(cast: HexagramCastResult): ReadingResult {
  const base = toReadingResult(cast);

  const bits = cast.lines.map((line) => (line.yinYang === "yang" ? 1 : 0)) as LineBit[];
  const lowerBits = bits.slice(0, 3) as [LineBit, LineBit, LineBit];
  const upperBits = bits.slice(3, 6) as [LineBit, LineBit, LineBit];
  const lowerTrigram = findTrigramByBits(lowerBits);
  const upperTrigram = findTrigramByBits(upperBits);
  const najia: NajiaEntry[] = [...NAJIA_TABLE[lowerTrigram].lower, ...NAJIA_TABLE[upperTrigram].upper];

  const palace = derivePalace(bits);
  const palaceElement = PALACE_ELEMENT[palace];

  const results: DrawResult[] = base.results.map((r, i) => ({
    ...r,
    stemBranch: najia[i].label,
    sixRelative: sixRelativeLabel(BRANCH_ELEMENT[najia[i].branch], palaceElement),
  }));

  return {
    ...base,
    results,
    palaceName: `${PALACE_LABEL[palace]} Palace (${palaceElement})`,
  };
}
