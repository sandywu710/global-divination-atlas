// ────────────────────────────────────────────────────────────
// App 圖示的視覺內容（給 icon.tsx / apple-icon.tsx / manifest 用的 PNG route 共用）
// 用簡單的幾何圖形做出「Atlas／星圖」意象：同心圓＋經緯線＋一個定位金點，
// 呼應第 13 節的編輯誌／博物館配色，之後想換圖示風格，改這裡就好。
// ────────────────────────────────────────────────────────────
import type { ReactElement } from "react";

const PALETTE = {
  ivory: "#f7f3ea",
  charcoal: "#2a2926",
  mistGold: "#b99a63",
  mistBlue: "#93a9b8",
};

/** @param size 圖示的邊長（正方形），例如 32、192、512 */
export function buildIconElement(size: number): ReactElement {
  const ring = Math.round(size * 0.62);
  const border = Math.max(1, Math.round(size * 0.02));
  const dot = Math.max(2, Math.round(size * 0.09));

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PALETTE.ivory,
      }}
    >
      {/* 外圈：象徵地球／星圖範圍 */}
      <div
        style={{
          width: ring,
          height: ring,
          borderRadius: "50%",
          border: `${border}px solid ${PALETTE.charcoal}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* 經線：一條縱向弧形用橢圓模擬 */}
        <div
          style={{
            width: Math.round(ring * 0.42),
            height: ring,
            borderRadius: "50%",
            border: `${border}px solid ${PALETTE.mistBlue}`,
            display: "flex",
          }}
        />
        {/* 緯線：一條橫線貫穿圓心 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            width: ring,
            height: border,
            background: PALETTE.mistBlue,
          }}
        />
        {/* 定位金點：象徵「你現在的位置／問題」 */}
        <div
          style={{
            position: "absolute",
            width: dot,
            height: dot,
            borderRadius: "50%",
            background: PALETTE.mistGold,
          }}
        />
      </div>
    </div>
  );
}
