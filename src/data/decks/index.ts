// ────────────────────────────────────────────────────────────
// 牌組登記表：deckId → 完整的 DeckDefinition
// 新增一套牌組只需要在這裡註冊一行，Random Draw Engine 完全不用改。
// ────────────────────────────────────────────────────────────
import type { DeckDefinition } from "@/types/randomDraw";
import { lenormandDeck } from "./lenormand";
import { riderWaiteTarotDeck } from "./riderWaiteTarot";

export const decks: Record<string, DeckDefinition> = {
  [riderWaiteTarotDeck.id]: riderWaiteTarotDeck,
  [lenormandDeck.id]: lenormandDeck,
};

export function getDeckById(id: string): DeckDefinition | undefined {
  return decks[id];
}
