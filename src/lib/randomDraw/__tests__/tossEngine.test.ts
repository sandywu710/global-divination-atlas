import { describe, expect, it } from "vitest";
import type { ObjectTossConfig } from "@/types/randomDraw";
import { tossObjects } from "../tossEngine";

const config: ObjectTossConfig = {
  randomizationMethod: "object-toss",
  objectCount: 16,
  objectLabel: "cowrie shell",
  markedFaceLabel: "Mouth-up (aperture visible)",
  unmarkedFaceLabel: "Mouth-down (back visible)",
};

describe("tossObjects", () => {
  it("回傳的物件數量跟 objectCount 一致", () => {
    const reading = tossObjects(config);
    expect(reading.results).toHaveLength(16);
    expect(reading.method).toBe("object-toss");
  });

  it("每一個物件的 itemId 只會是 marked 或 unmarked，且 itemName 跟 itemId 對得上", () => {
    for (let i = 0; i < 200; i++) {
      const reading = tossObjects(config);
      for (const r of reading.results) {
        expect(["marked", "unmarked"]).toContain(r.itemId);
        expect(r.itemName).toBe(r.itemId === "marked" ? config.markedFaceLabel : config.unmarkedFaceLabel);
      }
    }
  });

  it("positionLabel 依序帶編號，跟 objectLabel 對應", () => {
    const reading = tossObjects(config);
    reading.results.forEach((r, i) => {
      expect(r.positionLabel).toBe(`cowrie shell ${i + 1}`);
      expect(r.positionIndex).toBe(i);
    });
  });

  it("跑 2,000 次獨立擲（累計 32,000 個物件），marked 比例接近 50%，不會被問題文字或其他狀態影響", () => {
    let markedCount = 0;
    let total = 0;
    for (let i = 0; i < 2000; i++) {
      const reading = tossObjects(config);
      total += reading.results.length;
      markedCount += reading.results.filter((r) => r.itemId === "marked").length;
    }
    const ratio = markedCount / total;
    expect(ratio).toBeGreaterThan(0.47);
    expect(ratio).toBeLessThan(0.53);
  });

  it("每次呼叫都是獨立的新拋擲，不會回傳同一個物件參照（避免共用同一份陣列被意外改到）", () => {
    const a = tossObjects(config);
    const b = tossObjects(config);
    expect(a.results).not.toBe(b.results);
    expect(a.drawnAt).toBeTruthy();
  });
});
