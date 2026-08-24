import { describe, expect, it } from "vitest";
import { oghamDeck } from "../ogham";

describe("oghamDeck", () => {
  it("有 20 個字母", () => {
    expect(oghamDeck.itemCount).toBe(20);
    expect(oghamDeck.items).toHaveLength(20);
  });

  it("每個字母都有專屬的 Unicode 字符（glyph），彼此不重複，且落在 Ogham 這個字符區塊裡（U+1680-U+169F）", () => {
    const glyphs = oghamDeck.items.map((i) => i.glyph);
    expect(glyphs.every((g) => typeof g === "string" && g.length > 0)).toBe(true);
    expect(new Set(glyphs).size).toBe(glyphs.length);

    for (const g of glyphs) {
      const codepoint = g!.codePointAt(0)!;
      expect(codepoint).toBeGreaterThanOrEqual(0x1680);
      expect(codepoint).toBeLessThanOrEqual(0x169f);
    }
  });

  it("20 個字碼剛好是連續的一段（沒有跳號，代表位移量算得正確）", () => {
    const codepoints = oghamDeck.items.map((i) => i.glyph!.codePointAt(0)!).sort((a, b) => a - b);
    for (let i = 1; i < codepoints.length; i++) {
      expect(codepoints[i] - codepoints[i - 1]).toBe(1);
    }
  });
});
