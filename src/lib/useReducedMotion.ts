"use client";

import { useSyncExternalStore } from "react";

// 偵測使用者系統是否開啟「減少動態效果」（prefers-reduced-motion: reduce）。
// 用 useSyncExternalStore 而不是 useState + useEffect：這是標準寫法，讀取的是
// 瀏覽器的外部狀態（matchMedia），伺服器端渲染時沒有瀏覽器可以偵測，
// getServerSnapshot 提供一個安全的預設值，不會有 SSR 跟 client 端不一致的問題。
//
// Phase 1 的進場動畫本身用純 CSS 的 prefers-reduced-motion media query 處理，
// 不需要這個 hook；這個 hook是給 Phase 3 的滑鼠視差、Phase 2 的旋轉／閃爍動畫
// 之後要用 JS 判斷「要不要跑這段動畫邏輯」時用的。

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  const mediaQueryList = window.matchMedia(QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  // 伺服器端沒有辦法知道使用者的系統設定，先假設「沒有」開啟減少動態效果；
  // 這只會影響第一次繪製前的極短暫瞬間，實際動畫是否要簡化在 client 端會立刻校正。
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
