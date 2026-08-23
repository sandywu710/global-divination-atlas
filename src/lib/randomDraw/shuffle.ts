// ────────────────────────────────────────────────────────────
// 隨機工具：Fisher-Yates 洗牌 ＋ 正逆位判斷
//
// 隨機數來源優先用 window.crypto.getRandomValues（比 Math.random() 更接近真隨機），
// 環境不支援時（例如測試環境／舊瀏覽器）才 fallback 到 Math.random()。
//
// 這個檔案完全不接觸「使用者的問題文字」——任何函式都不會、也不應該收到 question
// 這個參數，確保抽牌結果不受問題內容影響。
// ────────────────────────────────────────────────────────────

/** 產生 [0, max) 的隨機整數，優先用 crypto，沒有才 fallback 到 Math.random() */
export function secureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    // 用拒絕採樣（rejection sampling）避免除不盡造成的微小機率偏誤
    const range = max;
    const maxUint32 = 0xffffffff;
    const limit = maxUint32 - (maxUint32 % range);
    const buf = new Uint32Array(1);
    let value: number;
    do {
      cryptoObj.getRandomValues(buf);
      value = buf[0];
    } while (value >= limit);
    return value % range;
  }
  return Math.floor(Math.random() * max);
}

/** Fisher-Yates shuffle，回傳一份新陣列（不會修改傳入的原陣列） */
export function fisherYatesShuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 依機率判斷這一張是否逆位；probability 是逆位的機率（預設 0.5） */
export function rollReversed(probability = 0.5): boolean {
  // secureRandomInt 內部已經處理好 crypto／Math.random 的 fallback，這裡不用重複判斷一次。
  // 用 0~9999 的整數映射機率，避免直接用不均勻的浮點數比較。
  return secureRandomInt(10000) < Math.round(probability * 10000);
}

/** 三枚銅板法用：擲一枚銅板，回傳 true = 正面（計 3）、false = 反面（計 2） */
export function coinFlipHeads(): boolean {
  return secureRandomInt(2) === 1;
}
