// ────────────────────────────────────────────────────────────
// 拋擲類共用隨機引擎：Ifá／貝殼占卜／骨占都用這一份邏輯，
// 差別只在傳入的 ObjectTossConfig（物件數量／稱呼／正反面文字）不同——
// 邏輯本身完全沿用 coinFlipHeads()（I Ching 起卦引擎也是用這個函式判斷正反面），
// 不重新發明一套隨機邏輯。
//
// 重要：這個函式的參數裡沒有、也不可以有「使用者問題文字」，
// 拋擲結果完全不受問題內容影響。
// ────────────────────────────────────────────────────────────
import type { DrawResult, ObjectTossConfig, ReadingResult } from "@/types/randomDraw";
import { coinFlipHeads } from "./shuffle";

/** 拋一組物件，每一個獨立擲一次正反面（各 50%，互不影響） */
export function tossObjects(config: ObjectTossConfig): ReadingResult {
  const results: DrawResult[] = Array.from({ length: config.objectCount }, (_, i) => {
    const marked = coinFlipHeads();
    return {
      // itemId 特意固定用 "marked"／"unmarked" 這兩個值（不是每個物件各自的花色 id），
      // 方便 promptGenerator.ts 之後直接數有幾個 marked，不用額外解析文字。
      itemId: marked ? "marked" : "unmarked",
      itemName: marked ? config.markedFaceLabel : config.unmarkedFaceLabel,
      positionIndex: i,
      positionLabel: `${config.objectLabel} ${i + 1}`,
    };
  });

  return {
    method: "object-toss",
    deckName: `${config.objectCount} × ${config.objectLabel}`,
    drawnAt: new Date().toISOString(),
    results,
  };
}
