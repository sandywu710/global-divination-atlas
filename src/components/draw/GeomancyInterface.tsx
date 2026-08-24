"use client";

import { useState } from "react";
import { castGeomanticChart, toReadingResult } from "@/lib/randomDraw/geomancyEngine";
import { addReadingHistoryEntry } from "@/lib/storage";
import type { DivinationSystem } from "@/types/divination";
import type { ReadingResult } from "@/types/randomDraw";

interface GeomancyInterfaceProps {
  system: DivinationSystem;
  /** 只用來顯示給使用者看，絕對不會被傳進任何點陣產生邏輯 */
  question: string;
  onComplete: (result: ReadingResult) => void;
  onReset?: () => void;
}

type Stage = "select" | "done";

// 點陣類系統（非洲土占／西方土占）共用的產生畫面：一次產生完整的 15 個圖形
// （Mothers／Daughters／Nieces／Witnesses／Judge），不像卡牌類系統需要「一張一張翻開」
// 的懸疑感——真實的戳沙占卜本來就是一次戳完所有點、馬上就能看到整份結果。
export default function GeomancyInterface({ system, question, onComplete, onReset }: GeomancyInterfaceProps) {
  const [stage, setStage] = useState<Stage>("select");
  const [reading, setReading] = useState<ReadingResult | null>(null);

  function handleGenerate() {
    // 真正的隨機產生只發生在這裡——4 個 Mother 圖形一次決定好，
    // 剩下的圖形都是機械式規則推算出來的，沒有額外的隨機性。
    const chart = castGeomanticChart();
    const result = toReadingResult(chart);
    setReading(result);
    addReadingHistoryEntry({ question, systemId: system.id, reading: result });
    onComplete(result);
    setStage("done");
  }

  function handleNewReading() {
    onReset?.();
    setReading(null);
    setStage("select");
  }

  return (
    <div className="rounded-2xl border hairline bg-paper p-5 sm:p-6">
      <div className="mb-5 space-y-1 border-b hairline pb-5">
        <p className="text-xs uppercase tracking-wide text-charcoal-soft">Geomancy Interface</p>
        <p className="text-sm text-charcoal-soft">
          系統：<span className="text-charcoal">{system.name}</span>
        </p>
        {question && (
          <p className="text-sm text-charcoal-soft">
            問題：<span className="text-charcoal">「{question}」</span>
          </p>
        )}
      </div>

      {stage === "select" && (
        <div className="space-y-4">
          <p className="text-sm text-charcoal-soft">
            隨機產生 4 組點陣（Mother 圖形，每組 4 條線，單點或雙點），並依傳統規則機械式推算出完整的
            15 個圖形（Mothers／Daughters／Nieces／Witnesses／Judge）。
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            className="tap-target w-full rounded-full bg-charcoal px-6 py-3.5 text-[15px] font-medium text-ivory transition-opacity hover:opacity-90 sm:w-auto"
          >
            Generate Chart
          </button>
        </div>
      )}

      {stage === "done" && reading && (
        <div className="space-y-5">
          <p className="text-sm text-charcoal-soft">已經產生完整圖表，以下是這次的結果（由上往下 4 條線，• 單點／•• 雙點）。</p>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {reading.results.map((r) => (
              <div key={r.positionLabel} className="rounded-xl border hairline bg-ivory p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-charcoal-soft">{r.positionLabel}</p>
                <p className="mt-1.5 whitespace-pre-line font-serif text-sm leading-relaxed text-charcoal">
                  {r.itemName.split(" / ").join("\n")}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNewReading}
            className="tap-target rounded-full border border-line bg-ivory px-5 py-2.5 text-sm text-charcoal-soft transition-colors hover:border-charcoal/50"
          >
            重新產生一次（New Reading）
          </button>
        </div>
      )}
    </div>
  );
}
