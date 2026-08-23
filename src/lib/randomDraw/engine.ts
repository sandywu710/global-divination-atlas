// ────────────────────────────────────────────────────────────
// Random Draw Engine：依 randomizationMethod 分派到對應的策略。
//
//   卡牌類策略（tarot / lenormand / rune / oracle / cartomancy 共用）
//     → cardEngine.drawCards()
//   coin-toss-hexagram（I Ching 專用）
//     → 機制完全不同（不是抽牌，是拋硬幣起卦），Phase 4 才實作，
//       這裡先明確拋出「尚未支援」而不是誤用卡牌邏輯硬套。
//
// 這是整個 Random Draw 功能唯一對外的入口，UI 元件只需要呼叫 runRandomDraw()，
// 不需要知道底層是卡牌還是銅板。
// ────────────────────────────────────────────────────────────
import { getDeckById } from "@/data/decks";
import type { RandomDrawConfig, ReadingResult } from "@/types/randomDraw";
import { drawCards, DrawConfigError } from "./cardEngine";
import { castHexagram, defaultCoinTossConfig, HexagramLookupError, toReadingResult } from "./ichingEngine";
import type { CoinTossHexagramConfig } from "@/types/randomDraw";

export { DrawConfigError, HexagramLookupError };
// I Ching 的起卦跟卡牌抽取機制完全不同（見 ichingEngine.ts 開頭的說明），
// 這裡只是把它一起 re-export 出去，讓 UI 元件只需要從 engine.ts 這一個地方 import。
export { castHexagram, defaultCoinTossConfig, toReadingResult };

const CARD_METHODS = new Set([
  "tarot-card-draw",
  "lenormand-card-draw",
  "rune-draw",
  "oracle-card-draw",
  "cartomancy-draw",
]);

/**
 * 執行一次完整的隨機抽取。
 * 注意：這個函式的參數裡沒有 question——抽取結果完全不受使用者問題內容影響。
 */
export function runRandomDraw(config: RandomDrawConfig, spreadId: string): ReadingResult {
  const spread = config.spreads.find((s) => s.id === spreadId);
  if (!spread) {
    throw new DrawConfigError(`找不到牌陣 id「${spreadId}」。`);
  }
  if (!config.drawCounts.includes(spread.cardCount)) {
    throw new DrawConfigError(`牌陣「${spread.name}」需要 ${spread.cardCount} 張，但這個系統不支援這個抽牌數量。`);
  }

  if (CARD_METHODS.has(config.randomizationMethod)) {
    const deck = getDeckById(config.deckId);
    if (!deck) {
      throw new DrawConfigError(`找不到牌組 id「${config.deckId}」，請確認資料是否已註冊在 src/data/decks/index.ts。`);
    }
    return drawCards(deck, spread, config);
  }

  throw new DrawConfigError(`randomizationMethod「${config.randomizationMethod}」不是卡牌類方法，請改用 runCoinTossHexagram() 或後續 Phase 才會支援的方法。`);
}

/**
 * I Ching 專用入口：一次擲完 6 爻並回傳跟卡牌類共用的 ReadingResult 形狀。
 * UI 如果要逐爻互動（每次點擊才擲一次），改用 ichingEngine.ts 的 tossLine()／resolveHexagram()。
 */
export function runCoinTossHexagram(config: CoinTossHexagramConfig): ReadingResult {
  return toReadingResult(castHexagram(config));
}
