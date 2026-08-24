// ────────────────────────────────────────────────────────────
// 牌組登記表：deckId → 完整的 DeckDefinition
// 新增一套牌組只需要在這裡註冊一行，Random Draw Engine 完全不用改。
// ────────────────────────────────────────────────────────────
import type { DeckDefinition } from "@/types/randomDraw";
import { cartomancyDeck } from "./cartomancy";
import { lenormandDeck } from "./lenormand";
import { marseilleTarotDeck } from "./marseilleTarot";
import { oghamDeck } from "./ogham";
import { riderWaiteTarotDeck } from "./riderWaiteTarot";
import { runesDeck } from "./runes";
import { thothTarotDeck } from "./thothTarot";

export const decks: Record<string, DeckDefinition> = {
  [riderWaiteTarotDeck.id]: riderWaiteTarotDeck,
  [lenormandDeck.id]: lenormandDeck,
  [runesDeck.id]: runesDeck,
  [marseilleTarotDeck.id]: marseilleTarotDeck,
  [thothTarotDeck.id]: thothTarotDeck,
  [cartomancyDeck.id]: cartomancyDeck,
  [oghamDeck.id]: oghamDeck,
};

export function getDeckById(id: string): DeckDefinition | undefined {
  return decks[id];
}
