// ────────────────────────────────────────────────────────────
// 分類 / 地區 的中文對照表
// 只是「顯示用的文字」，之後要改文案，直接改這裡的 label 就好，
// 不會動到任何邏輯或資料結構。
// ────────────────────────────────────────────────────────────
import type { SystemCategory } from "@/types/divination";

export const categoryLabels: Record<SystemCategory, string> = {
  Astrology: "占星學",
  "Chinese Divination": "中國命理",
  "Indian Divination": "印度命理",
  "Japanese Divination": "日本命理",
  "Korean Divination": "韓國命理",
  "Tibetan Divination": "西藏占卜",
  "Western Esotericism": "西方神秘學",
  Tarot: "塔羅牌",
  Cartomancy: "紙牌占卜",
  Runes: "盧恩符文",
  Geomancy: "土占",
  Numerology: "數字學",
  "African Divination": "非洲占卜",
  "Dream Divination": "夢境占卜",
  Spirituality: "靈性系統",
  Energy: "能量系統",
  Symbolic: "象徵系統",
  "Modern Esoteric": "現代神秘學",
};

export const allCategories: SystemCategory[] = Object.keys(categoryLabels) as SystemCategory[];

/** Region 篩選用的地區清單（對應 systems.ts 裡每個系統的 region 欄位） */
export const regionLabels: Record<string, string> = {
  China: "中國",
  Japan: "日本",
  Korea: "韓國",
  India: "印度",
  Tibet: "西藏",
  "Middle East": "中東",
  Europe: "歐洲",
  Africa: "非洲",
  Americas: "美洲",
  "Global / Modern": "全球／現代",
};

export const allRegions: string[] = Object.keys(regionLabels);

/** "Best For" 篩選用的探索主題（挑常用、使用者容易理解的子集） */
export const bestForLabels: Record<string, string> = {
  Career: "事業",
  Money: "金錢",
  Love: "感情",
  Marriage: "婚姻",
  Relationships: "關係",
  Family: "家庭",
  Decision: "決策",
  Timing: "時機",
  "Future Trends": "未來趨勢",
  "Specific Event": "具體事件",
  "Past Life": "前世",
  Karma: "業力／因果",
  "Soul Purpose": "人生使命",
  "Spiritual Growth": "靈性成長",
  Personality: "個性探索",
  Dreams: "夢境",
};

export const allBestFor: string[] = Object.keys(bestForLabels);
