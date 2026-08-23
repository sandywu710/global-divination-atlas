import { describe, expect, it } from "vitest";
import { drawCards } from "@/lib/randomDraw/cardEngine";
import type { RandomDrawConfig, SpreadDefinition } from "@/types/randomDraw";
import { runesDeck, runeSpreads } from "../runes";

describe("runesDeck", () => {
  it("有 24 個符文", () => {
    expect(runesDeck.itemCount).toBe(24);
    expect(runesDeck.items).toHaveLength(24);
  });

  it("每個符文都有專屬的 Unicode 字符（glyph），且不重複", () => {
    const glyphs = runesDeck.items.map((i) => i.glyph);
    expect(glyphs.every((g) => typeof g === "string" && g.length > 0)).toBe(true);
    expect(new Set(glyphs).size).toBe(glyphs.length);
  });

  it("對稱字形的符文被標記為 reversible: false，其餘沒有特別標記（預設看正逆位）", () => {
    const nonReversibleNames = runesDeck.items.filter((i) => i.reversible === false).map((i) => i.name);
    expect(new Set(nonReversibleNames)).toEqual(
      new Set(["Gebo", "Hagalaz", "Isa", "Jera", "Ingwaz", "Dagaz", "Othala"])
    );

    const reversibleCount = runesDeck.items.filter((i) => i.reversible !== false).length;
    expect(reversibleCount).toBe(24 - 7);
  });

  it("整合測試：即使系統支援正逆位，reversible:false 的符文抽到時也不會被標記正逆位（1,000 次抽樣）", () => {
    const config: RandomDrawConfig = {
      randomizationMethod: "rune-draw",
      deckId: runesDeck.id,
      drawCounts: [1],
      spreads: runeSpreads,
      allowRepeats: false,
      supportsReversed: true,
    };
    const spread: SpreadDefinition = runeSpreads.find((s) => s.id === "quick-insight")!;
    const nonReversibleNames = new Set(
      runesDeck.items.filter((i) => i.reversible === false).map((i) => i.name)
    );

    for (let i = 0; i < 1000; i++) {
      const result = drawCards(runesDeck, spread, config).results[0];
      if (nonReversibleNames.has(result.itemName)) {
        expect(result.reversed).toBeUndefined();
      }
    }
  });
});
