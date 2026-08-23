import { describe, expect, it } from "vitest";
import { decks } from "../index";

// 資料完整性檢查：確保每一套牌組的資料本身是自洽的（張數對得上、id 不重複），
// 之後新增牌組（例如 Runes）只要註冊進 decks/index.ts，這裡就會自動一起檢查。
describe("deck registry", () => {
  const deckList = Object.values(decks);

  it("至少註冊了一套牌組", () => {
    expect(deckList.length).toBeGreaterThan(0);
  });

  it.each(deckList.map((d) => [d.id, d] as const))("%s：items 數量跟 itemCount 一致", (_id, deck) => {
    expect(deck.items).toHaveLength(deck.itemCount);
  });

  it.each(deckList.map((d) => [d.id, d] as const))("%s：每張牌的 id 都不重複", (_id, deck) => {
    const ids = deck.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(deckList.map((d) => [d.id, d] as const))("%s：每張牌都有非空的名稱", (_id, deck) => {
    for (const item of deck.items) {
      expect(item.name.trim().length).toBeGreaterThan(0);
    }
  });
});
