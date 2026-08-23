"use client";

import { useState } from "react";
import { resolveHexagram, tossLine, toReadingResult, type HexagramLine } from "@/lib/randomDraw/ichingEngine";
import { addReadingHistoryEntry } from "@/lib/storage";
import type { DivinationSystem } from "@/types/divination";
import type { CoinTossHexagramConfig, ReadingResult } from "@/types/randomDraw";
import HexagramLineBar from "./HexagramLineBar";

interface IChingCastInterfaceProps {
  system: DivinationSystem;
  /** 只用來顯示給使用者看，絕對不會被傳進任何起卦邏輯 */
  question: string;
  onComplete: (result: ReadingResult) => void;
  onReset?: () => void;
}

type Stage = "select" | "casting" | "done";

const lineLabels = ["Line 1 (bottom)", "Line 2", "Line 3", "Line 4", "Line 5", "Line 6 (top)"];

// I Ching 專用的起卦畫面：三枚銅板法，由下往上擲 6 次。跟 DrawInterface（卡牌類）
// 是完全獨立的元件，因為機制本質不同——這裡沒有「牌陣」，每一爻是獨立、依序擲出的。
export default function IChingCastInterface({ system, question, onComplete, onReset }: IChingCastInterfaceProps) {
  const config = (system.randomDraw?.randomizationMethod === "coin-toss-hexagram"
    ? system.randomDraw
    : undefined) as CoinTossHexagramConfig | undefined;

  const [stage, setStage] = useState<Stage>("select");
  const [lines, setLines] = useState<(HexagramLine | null)[]>(Array(6).fill(null));
  const [finalReading, setFinalReading] = useState<ReadingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!config) {
    return (
      <p className="rounded-2xl border hairline bg-paper p-5 text-sm text-accent-red">
        這個系統缺少起卦設定（randomDraw），請確認 src/data/systems.ts 的資料是否正確。
      </p>
    );
  }

  const nextIndex = lines.findIndex((l) => l === null);

  function handleStart() {
    setLines(Array(6).fill(null));
    setError(null);
    setStage("casting");
  }

  function handleToss(index: number) {
    if (!config) return;
    try {
      const line = tossLine(config);
      const next = [...lines];
      next[index] = line;
      setLines(next);

      if (next.every((l) => l !== null)) {
        const resolved = resolveHexagram(next as HexagramLine[]);
        const reading = toReadingResult(resolved);
        setFinalReading(reading);
        addReadingHistoryEntry({ question, systemId: system.id, reading });
        onComplete(reading);
        setStage("done");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "起卦時發生未預期的錯誤，請重新整理頁面再試一次。");
    }
  }

  function handleNewReading() {
    onReset?.();
    setLines(Array(6).fill(null));
    setFinalReading(null);
    setStage("select");
  }

  // 畫面由上往下顯示第 6 爻到第 1 爻，符合傳統卦畫「由下往上疊」的閱讀方向
  const displayOrder = [5, 4, 3, 2, 1, 0];

  return (
    <div className="rounded-2xl border hairline bg-paper p-5 sm:p-6">
      <div className="mb-5 space-y-1 border-b hairline pb-5">
        <p className="text-xs uppercase tracking-wide text-charcoal-soft">Draw Interface — 3-Coin Method</p>
        <p className="text-sm text-charcoal-soft">
          系統：<span className="text-charcoal">{system.name}</span>
        </p>
        {question && (
          <p className="text-sm text-charcoal-soft">
            問題：<span className="text-charcoal">「{question}」</span>
          </p>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-accent-red/40 bg-accent-red/10 p-3 text-sm text-accent-red">
          {error}
        </p>
      )}

      {stage === "select" && (
        <div className="space-y-4">
          <p className="text-sm text-charcoal-soft">
            傳統三枚銅板法：由下往上共擲 6 次，每次拋 3 枚銅板，正面計 3、反面計 2，
            三枚加總決定這一爻是陰是陽、是否為變爻。
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="tap-target w-full rounded-full bg-charcoal px-6 py-3.5 text-[15px] font-medium text-ivory transition-opacity hover:opacity-90 sm:w-auto"
          >
            Cast your hexagram
          </button>
        </div>
      )}

      {(stage === "casting" || stage === "done") && (
        <div className="space-y-6">
          <p className="text-sm text-charcoal-soft">
            {stage === "casting" ? "依序由下往上擲筊，6 爻擲完才能產生 Prompt。" : "已經起卦完成，以下是這次的結果。"}
          </p>

          <div className="space-y-2 rounded-xl border hairline bg-ivory p-4">
            {displayOrder.map((i) => (
              <HexagramLineBar
                key={i}
                line={lines[i]}
                label={lineLabels[i]}
                actionable={i === nextIndex}
                onToss={() => handleToss(i)}
              />
            ))}
          </div>

          {stage === "done" && finalReading && (
            <div className="space-y-3 border-t hairline pt-5">
              <HexagramSummary reading={finalReading} />
              <button
                type="button"
                onClick={handleNewReading}
                className="tap-target rounded-full border border-line bg-ivory px-5 py-2.5 text-sm text-charcoal-soft transition-colors hover:border-charcoal/50"
              >
                重新起卦一次（New Reading）
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HexagramSummary({ reading }: { reading: ReadingResult }) {
  return (
    <div className="space-y-1 text-sm text-charcoal-soft">
      <p className="font-medium text-charcoal">本卦：{reading.hexagramName}</p>
      {reading.resultingHexagramName ? (
        <>
          <p>變爻：第 {(reading.changingLineIndices ?? []).map((i) => i + 1).join("、")} 爻（由下往上算）</p>
          <p className="font-medium text-charcoal">之卦：{reading.resultingHexagramName}</p>
        </>
      ) : (
        <p>沒有變爻，只看本卦。</p>
      )}
    </div>
  );
}
