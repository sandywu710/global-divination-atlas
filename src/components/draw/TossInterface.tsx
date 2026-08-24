"use client";

import { useState } from "react";
import { tossObjects } from "@/lib/randomDraw/tossEngine";
import { addReadingHistoryEntry } from "@/lib/storage";
import type { DivinationSystem } from "@/types/divination";
import type { DeckItem, ObjectTossConfig, ReadingResult } from "@/types/randomDraw";
import DrawCardSlot from "./DrawCardSlot";

interface TossInterfaceProps {
  system: DivinationSystem;
  /** 只用來顯示給使用者看，絕對不會被傳進任何拋擲邏輯 */
  question: string;
  onComplete: (result: ReadingResult) => void;
  onReset?: () => void;
}

type Stage = "select" | "revealing" | "done";

// 拋擲類系統（Ifá／貝殼占卜／骨占）共用的抽取畫面：一次拋完全部物件，
// 使用者再逐一點開看每一個是正面還是反面朝上。翻牌動畫直接沿用 DrawCardSlot
// （卡牌類系統也在用同一個元件），把每個拋擲結果包成一個小小的「假牌」餵給它，
// 純粹是為了畫面呈現一致，不是真的在抽卡牌。
export default function TossInterface({ system, question, onComplete, onReset }: TossInterfaceProps) {
  const drawConfig = system.randomDraw;
  const config: ObjectTossConfig | undefined =
    drawConfig && drawConfig.randomizationMethod === "object-toss" ? drawConfig : undefined;
  const [stage, setStage] = useState<Stage>("select");
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

  if (!config) {
    // 防呆：理論上不會走到這裡（父層已經檢查過 requiresRandomDraw），保留清楚的錯誤訊息而不是讓畫面空白當掉
    return (
      <p className="rounded-2xl border hairline bg-paper p-5 text-sm text-accent-red">
        這個系統缺少拋擲設定（randomDraw），請確認 src/data/systems.ts 的資料是否正確。
      </p>
    );
  }

  function handleToss() {
    if (!config) return;
    // 真正的隨機拋擲只發生在這裡，而且只發生一次——之後使用者一個一個翻開看，
    // 看到的都是同一組已經決定好的結果，不會因為點擊順序改變或重新拋擲。
    const result = tossObjects(config);
    setReading(result);
    setFlippedIndices(new Set());
    setStage("revealing");
  }

  function handleFlip(index: number) {
    if (!reading) return;
    const next = new Set(flippedIndices);
    next.add(index);
    setFlippedIndices(next);

    if (next.size === reading.results.length) {
      addReadingHistoryEntry({ question, systemId: system.id, reading });
      onComplete(reading);
      setStage("done");
    }
  }

  function handleNewReading() {
    onReset?.();
    setReading(null);
    setFlippedIndices(new Set());
    setStage("select");
  }

  return (
    <div className="rounded-2xl border hairline bg-paper p-5 sm:p-6">
      <div className="mb-5 space-y-1 border-b hairline pb-5">
        <p className="text-xs uppercase tracking-wide text-charcoal-soft">Toss Interface</p>
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
            拋擲 {config.objectCount} 個{config.objectLabel}，每一個獨立記錄正面或反面朝上。
          </p>
          <button
            type="button"
            onClick={handleToss}
            className="tap-target w-full rounded-full bg-charcoal px-6 py-3.5 text-[15px] font-medium text-ivory transition-opacity hover:opacity-90 sm:w-auto"
          >
            Toss
          </button>
        </div>
      )}

      {(stage === "revealing" || stage === "done") && reading && (
        <div className="space-y-6">
          <p className="text-sm text-charcoal-soft">
            {stage === "revealing" ? "依序點擊翻開，全部翻完才能產生 Prompt。" : "已經拋完，以下是這次的結果。"}
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(84px,1fr))] gap-3 sm:gap-4">
            {reading.results.map((result, index) => {
              // DrawCardSlot 需要一個 DeckItem 形狀的物件——這裡不是真的牌，只是借用同一個
              // 翻牌動畫元件，讓拋擲類系統的畫面風格跟卡牌類系統一致。
              const pseudoItem: DeckItem = { id: result.itemId, name: result.itemName };
              return (
                <DrawCardSlot
                  key={result.positionLabel}
                  item={pseudoItem}
                  result={result}
                  flipped={flippedIndices.has(index)}
                  onFlip={() => handleFlip(index)}
                />
              );
            })}
          </div>

          {stage === "done" && (
            <div className="space-y-3 border-t hairline pt-5">
              <p className="text-sm font-medium text-charcoal">
                拋擲結果：{reading.results.filter((r) => r.itemId === "marked").length} / {reading.results.length} 個正面朝上
              </p>
              <button
                type="button"
                onClick={handleNewReading}
                className="tap-target rounded-full border border-line bg-ivory px-5 py-2.5 text-sm text-charcoal-soft transition-colors hover:border-charcoal/50"
              >
                重新拋一次（New Reading）
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
