"use client";

import { useState } from "react";
import { getSystemById } from "@/data/systems";
import { loadReadingHistory, type ReadingHistoryEntry } from "@/lib/storage";

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-TW", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function ReadingCard({ entry }: { entry: ReadingHistoryEntry }) {
  const system = getSystemById(entry.systemId);
  return (
    <div className="rounded-2xl border hairline bg-paper p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-serif text-lg text-charcoal">{system?.name ?? entry.systemId}</p>
        <p className="text-xs text-charcoal-soft">{formatTimestamp(entry.timestamp)}</p>
      </div>
      {entry.question && <p className="mt-1 text-sm text-charcoal-soft">「{entry.question}」</p>}
      <ol className="mt-3 space-y-1 text-sm text-charcoal-soft">
        {entry.results.map((r, i) => (
          <li key={`${r.itemId}-${i}`}>
            {i + 1}. {r.positionLabel ? `${r.positionLabel} — ` : ""}
            {r.itemName}
            {r.reversed !== undefined && (r.reversed ? "（逆位）" : "（正位）")}
          </li>
        ))}
      </ol>
    </div>
  );
}

// 抽牌／起卦歷史紀錄：只讀 LocalStorage，沒有任何伺服器端資料。
export default function HistoryPage() {
  // 用 lazy initializer 而不是 useEffect：這個函式只在 client 端第一次 render（也就是
  // hydration）時執行一次，那時候 window 已經存在，可以直接拿到正確的 LocalStorage 資料，
  // 不會有畫面先空白、再補資料的閃爍（跟 PromptGenerator.tsx 的 profile 是同一個理由）。
  const [entries] = useState<ReadingHistoryEntry[]>(() => loadReadingHistory());

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">抽牌紀錄</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal-soft">
          這裡列出你在這個瀏覽器裡實際抽過的牌／符文／卦象結果，只存在你自己的裝置上，沒有上傳到任何伺服器。
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="rounded-2xl border hairline bg-paper p-8 text-center text-sm text-charcoal-soft">
          目前還沒有任何抽牌紀錄。去「探索系統」選一個像塔羅這樣需要抽牌的系統，完成一次 Reading 後就會出現在這裡。
        </p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <ReadingCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
