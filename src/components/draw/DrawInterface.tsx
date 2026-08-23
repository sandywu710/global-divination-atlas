"use client";

import { useMemo, useState } from "react";
import { getDeckById } from "@/data/decks";
import { addReadingHistoryEntry } from "@/lib/storage";
import { DrawConfigError, runRandomDraw } from "@/lib/randomDraw/engine";
import type { DivinationSystem } from "@/types/divination";
import type { RandomDrawConfig, ReadingResult, SpreadDefinition } from "@/types/randomDraw";
import DrawCardSlot from "./DrawCardSlot";

interface DrawInterfaceProps {
  system: DivinationSystem;
  /** 只用來顯示給使用者看，絕對不會被傳進任何抽牌／隨機邏輯 */
  question: string;
  onComplete: (result: ReadingResult) => void;
  /** 使用者按「New Reading」重新開始時觸發，讓父層知道「這個系統目前還沒有可用的抽牌結果」 */
  onReset?: () => void;
}

type Stage = "select" | "revealing" | "done";

// Before / During / After 三階段的抽牌畫面，給卡牌類系統（Tarot／Lenormand／Runes...）用。
// I Ching 的三枚銅板法機制完全不同，用獨立的 IChingCastInterface 元件（見同資料夾）。
// 這是 Random Draw 功能唯一的互動入口：抽牌邏輯（Random Draw Engine）永遠拿不到
// question，這裡的 question 只用來顯示，維持「隨機屬於應用程式」的原則。
export default function DrawInterface({ system, question, onComplete, onReset }: DrawInterfaceProps) {
  // 這個元件只給卡牌類系統用（PromptGenerator 已經依 randomizationMethod 分流），
  // 這裡窄化型別把 CoinTossHexagramConfig 排除掉，避免誤用到不存在的 deckId/spreads 欄位
  const config: RandomDrawConfig | undefined =
    system.randomDraw?.randomizationMethod !== "coin-toss-hexagram" ? system.randomDraw : undefined;
  const [stage, setStage] = useState<Stage>("select");
  const [selectedSpreadId, setSelectedSpreadId] = useState<string | null>(config?.spreads[0]?.id ?? null);
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const deck = useMemo(() => (config ? getDeckById(config.deckId) : undefined), [config]);
  const itemsById = useMemo(() => new Map((deck?.items ?? []).map((i) => [i.id, i])), [deck]);

  if (!config) {
    // 防呆：理論上不會走到這裡（父層已經檢查過 requiresRandomDraw），保留清楚的錯誤訊息而不是讓畫面空白當掉
    return (
      <p className="rounded-2xl border hairline bg-paper p-5 text-sm text-accent-red">
        這個系統缺少抽牌設定（randomDraw），請確認 src/data/systems.ts 的資料是否正確。
      </p>
    );
  }

  const availableSpreads = config.spreads.filter((s) => config.drawCounts.includes(s.cardCount));
  const selectedSpread: SpreadDefinition | undefined = availableSpreads.find((s) => s.id === selectedSpreadId);

  function handleStartDraw() {
    if (!config || !selectedSpread) return;
    setError(null);
    try {
      // 真正的隨機抽取只發生在這裡，而且只發生一次——之後使用者一張一張翻開，
      // 看到的都是同一組已經決定好的結果，不會因為點擊順序改變或重新洗牌。
      const result = runRandomDraw(config, selectedSpread.id);
      setReading(result);
      setFlippedIndices(new Set());
      setStage("revealing");
    } catch (e) {
      setError(e instanceof DrawConfigError ? e.message : "抽牌時發生未預期的錯誤，請重新整理頁面再試一次。");
    }
  }

  function handleFlip(index: number) {
    if (!reading) return;
    const next = new Set(flippedIndices);
    next.add(index);
    setFlippedIndices(next);

    if (next.size === reading.results.length) {
      // 全部翻完 → 記錄到 Reading History，並通知父層（PromptGenerator）可以繼續往下走
      addReadingHistoryEntry({ question, systemId: system.id, reading });
      onComplete(reading);
      setStage("done");
    }
  }

  function handleNewReading() {
    onReset?.(); // 通知父層：這個系統目前還沒有可用的抽牌結果，先把「產生 Prompt」區塊藏起來
    setReading(null);
    setFlippedIndices(new Set());
    setStage("select");
  }

  return (
    <div className="rounded-2xl border hairline bg-paper p-5 sm:p-6">
      <div className="mb-5 space-y-1 border-b hairline pb-5">
        <p className="text-xs uppercase tracking-wide text-charcoal-soft">Draw Interface</p>
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
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-charcoal">選擇牌陣</p>
            <div className="flex flex-wrap gap-2">
              {availableSpreads.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSpreadId(s.id)}
                  className={`tap-target rounded-full border px-4 py-2 text-sm transition-colors ${
                    selectedSpreadId === s.id
                      ? "border-charcoal bg-charcoal text-ivory"
                      : "border-line bg-ivory text-charcoal-soft hover:border-charcoal/50"
                  }`}
                >
                  {s.name}（{s.cardCount} 張）
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartDraw}
            disabled={!selectedSpread}
            className="tap-target w-full rounded-full bg-charcoal px-6 py-3.5 text-[15px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
          >
            Draw your cards
          </button>
        </div>
      )}

      {(stage === "revealing" || stage === "done") && reading && (
        <div className="space-y-6">
          <p className="text-sm text-charcoal-soft">
            {stage === "revealing"
              ? "依序點擊牌背翻開，翻完全部才能產生 Prompt。"
              : "已經抽完，以下是這次的抽牌結果。"}
          </p>

          {/* 用 auto-fit 讓 1／3／5 張（甚至未來更多張）都能依容器寬度自動排列，
              不用針對每種抽牌張數各寫一組斷點 class */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(84px,1fr))] gap-3 sm:gap-4">

            {reading.results.map((result, index) => {
              const item = itemsById.get(result.itemId);
              if (!item) return null; // 理論上不會發生（結果一定來自同一個 deck）
              return (
                <DrawCardSlot
                  key={result.itemId}
                  item={item}
                  result={result}
                  flipped={flippedIndices.has(index)}
                  onFlip={() => handleFlip(index)}
                />
              );
            })}
          </div>

          {stage === "done" && (
            <div className="space-y-3 border-t hairline pt-5">
              <p className="text-sm font-medium text-charcoal">抽牌結果（依抽出順序）</p>
              <ol className="space-y-1 text-sm text-charcoal-soft">
                {reading.results.map((r, i) => (
                  <li key={r.itemId}>
                    {i + 1}. {r.positionLabel ? `${r.positionLabel} — ` : ""}
                    {r.itemName}
                    {r.reversed !== undefined && (r.reversed ? "（逆位 Reversed）" : "（正位 Upright）")}
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={handleNewReading}
                className="tap-target rounded-full border border-line bg-ivory px-5 py-2.5 text-sm text-charcoal-soft transition-colors hover:border-charcoal/50"
              >
                重新抽一次（New Reading）
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
