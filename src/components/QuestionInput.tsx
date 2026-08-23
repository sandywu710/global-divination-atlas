"use client";

import { useState } from "react";

const examples = [
  "我今年適合換工作嗎？",
  "我跟這個人最後會在一起嗎？",
  "我為什麼一直遇到類似的人？",
  "我這輩子的使命是什麼？",
  "這個創業方向值得做嗎？",
];

interface QuestionInputProps {
  initialValue?: string;
  onSubmit: (question: string) => void;
}

// /analyzer 首屏的大輸入框：「你現在最想知道什麼？」
export default function QuestionInput({ initialValue = "", onSubmit }: QuestionInputProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="rounded-2xl border hairline bg-paper p-5 sm:p-7">
      <label htmlFor="question" className="mb-3 block font-serif text-xl text-charcoal sm:text-2xl">
        你現在最想知道什麼？
      </label>
      <textarea
        id="question"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="用你自己的話寫下來就好，例如：我明年適不適合離職？"
        className="w-full rounded-xl border hairline bg-ivory px-4 py-3 text-[15px] text-charcoal placeholder:text-charcoal-soft/60 focus:border-charcoal focus:outline-none"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setValue(ex)}
            className="tap-target rounded-full border border-line bg-ivory-soft px-3 py-1.5 text-xs text-charcoal-soft hover:border-charcoal/40"
          >
            {ex}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => value.trim() && onSubmit(value.trim())}
        disabled={!value.trim()}
        className="tap-target mt-5 w-full rounded-full bg-charcoal px-6 py-3.5 text-[15px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
      >
        分析我的問題
      </button>
    </div>
  );
}
