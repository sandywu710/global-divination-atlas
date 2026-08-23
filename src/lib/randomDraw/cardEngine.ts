// ────────────────────────────────────────────────────────────
// 卡牌類共用抽取引擎：Tarot / Lenormand / Runes / Oracle / Cartomancy 都用這一份邏輯，
// 差別只在傳入的 DeckDefinition／SpreadDefinition 不同。
//
// 重要：這個函式的參數裡沒有、也不可以有「使用者問題文字」，
// 抽牌結果完全不受問題內容影響。
// ────────────────────────────────────────────────────────────
import type { DeckDefinition, DrawResult, RandomDrawConfig, ReadingResult, SpreadDefinition } from "@/types/randomDraw";
import { fisherYatesShuffle, rollReversed } from "./shuffle";

export class DrawConfigError extends Error {}

/**
 * 抽卡牌類（tarot / lenormand / rune / oracle / cartomancy 共用）。
 * - Fisher-Yates 洗整副牌，取前 N 張（不放回，allowRepeats 一律當作 false 處理）
 * - 每張牌獨立擲一次正逆位（不是跟著洗牌順序決定）
 */
export function drawCards(deck: DeckDefinition, spread: SpreadDefinition, config: RandomDrawConfig): ReadingResult {
  if (spread.cardCount > deck.itemCount) {
    // 防呆：理論上不該發生（資料層設定錯誤），清楚拋出錯誤而不是讓程式在後面某處默默壞掉
    throw new DrawConfigError(
      `牌陣需要 ${spread.cardCount} 張牌，但牌組「${deck.name}」只有 ${deck.itemCount} 張，無法抽取。`
    );
  }
  if (spread.positions.length !== spread.cardCount) {
    throw new DrawConfigError(`牌陣「${spread.name}」的位置數量（${spread.positions.length}）跟 cardCount（${spread.cardCount}）對不上。`);
  }

  const shuffled = fisherYatesShuffle(deck.items);
  const drawn = shuffled.slice(0, spread.cardCount);
  const reversedProbability = config.reversedProbability ?? 0.5;

  const results: DrawResult[] = drawn.map((item, index) => {
    const canReverse = config.supportsReversed && (item.reversible ?? true);
    return {
      itemId: item.id,
      itemName: item.name,
      positionIndex: index,
      positionLabel: spread.positions[index]?.label,
      reversed: canReverse ? rollReversed(reversedProbability) : undefined,
    };
  });

  return {
    method: config.randomizationMethod,
    deckId: deck.id,
    deckName: deck.name,
    spreadId: spread.id,
    spreadName: spread.name,
    drawnAt: new Date().toISOString(),
    results,
  };
}
