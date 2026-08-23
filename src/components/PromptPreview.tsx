"use client";

import { useState } from "react";

// 顯示產生好的 Prompt，並提供複製按鈕。
// 手機上複製按鈕貼齊底部並固定，方便單手操作；桌面版則放在預覽框上方。
export default function PromptPreview({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 部分瀏覽器環境（例如非 https）可能無法使用剪貼簿 API，讓使用者自行選取文字複製。
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border hairline bg-paper">
      <div className="flex items-center justify-between border-b hairline px-5 py-3">
        <p className="text-sm text-charcoal-soft">完整 Prompt（英文，可直接複製貼給 AI）</p>
        <button
          type="button"
          onClick={handleCopy}
          className="tap-target rounded-full bg-charcoal px-4 py-2 text-sm text-ivory transition-opacity hover:opacity-90"
        >
          {copied ? "已複製 ✓" : "複製全部"}
        </button>
      </div>
      <div className="max-h-[420px] overflow-y-auto px-5 py-4">
        <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed text-charcoal">
          {prompt}
        </pre>
      </div>
    </div>
  );
}
