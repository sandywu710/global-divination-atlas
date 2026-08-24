// ────────────────────────────────────────────────────────────
// 推薦規則表：「問題意圖」→「適合的系統 id 清單」
// 這是推薦引擎最主要的判斷依據（規則式，不需要 AI）。
//
// 之後想要調整「某類問題該推薦哪些系統」，直接改這裡對應意圖底下的陣列就好。
// 陣列順序有意義：越前面代表越核心、越優先推薦。
// ────────────────────────────────────────────────────────────
import type { QuestionIntent } from "@/types/divination";

export const recommendationRules: Record<QuestionIntent, string[]> = {
  Career: ["bazi", "vedic-astrology", "kp-astrology", "ziwei", "western-astrology", "koreansaju", "human-design"],
  "Job Change": ["bazi", "vedic-astrology", "kp-astrology", "ziwei", "qimen", "iching"],
  Business: ["qimen", "bazi", "electional-astrology", "ziwei", "human-design"],
  Money: ["bazi", "ziwei", "vedic-astrology", "arabic-parts", "koreansaju"],
  "Investment Decision": ["iching", "liuyao", "horary-astrology", "qimen", "kp-astrology"],
  Love: ["synastry-astrology", "sukuyodo", "western-astrology", "lenormand", "rider-waite-tarot"],
  Marriage: ["ziwei", "vedic-astrology", "synastry-astrology", "koreansaju", "kp-astrology"],
  Compatibility: ["synastry-astrology", "sukuyodo", "vedic-astrology", "western-astrology"],
  Relationship: ["synastry-astrology", "lenormand", "rider-waite-tarot", "sukuyodo"],
  Breakup: ["rider-waite-tarot", "lenormand", "iching", "synastry-astrology"],
  Family: ["bazi", "ziwei", "bone-divination", "chakra-reading"],
  "Life Purpose": ["vedic-astrology", "human-design", "gene-keys", "jaimini-astrology", "soul-contract"],
  "Soul Purpose": ["gene-keys", "akashic-records", "soul-contract", "vedic-astrology", "human-design"],
  "Personal Growth": ["gene-keys", "chakra-reading", "dream-divination", "thoth-tarot", "human-design"],
  Future: ["bazi", "ziwei", "vedic-astrology", "iching", "western-astrology"],
  Timing: ["vimshottari-dasha", "qimen", "electional-astrology", "kp-astrology", "daliuren", "ninestarki"],
  Decision: ["iching", "liuyao", "meihua", "horary-astrology", "rider-waite-tarot", "runes"],
  "Specific Event": ["liuyao", "daliuren", "horary-astrology", "kp-astrology", "meihua", "lenormand"],
  Past: ["nadi-astrology", "past-life-exploration", "akashic-records"],
  Karma: ["nadi-astrology", "akashic-records", "soul-contract", "vedic-astrology"],
  "Past Life": ["nadi-astrology", "past-life-exploration", "akashic-records"],
  Spirituality: ["akashic-records", "chakra-reading", "aura-reading", "gene-keys", "ifa"],
  Dreams: ["dream-divination", "scrying"],
  Personality: ["western-astrology", "bazi", "ziwei", "human-design", "pythagorean-numerology", "ninestarki"],
  "Self Understanding": ["human-design", "gene-keys", "dream-divination", "western-astrology", "chakra-reading"],
};
