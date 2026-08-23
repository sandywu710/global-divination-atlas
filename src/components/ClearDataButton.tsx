"use client";

import { useState } from "react";
import { clearAllData } from "@/lib/storage";

// 放在頁尾的「清除我的資料」按鈕：把 LocalStorage 裡的個人資料、收藏、Prompt 紀錄全部清掉。
export default function ClearDataButton() {
  const [done, setDone] = useState(false);

  function handleClear() {
    if (!window.confirm("確定要清除所有已儲存的個人資料嗎？這個動作沒辦法復原。")) return;
    clearAllData();
    setDone(true);
    setTimeout(() => setDone(false), 2500);
    window.location.reload();
  }

  return (
    <button type="button" onClick={handleClear} className="tap-target inline text-charcoal-soft underline underline-offset-2 hover:text-charcoal">
      {done ? "已清除 ✓" : "清除我的資料"}
    </button>
  );
}
