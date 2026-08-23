"use client";

import type { CSSProperties } from "react";
import { motionConfig } from "@/lib/motionConfig";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

// Hero 背景的氛圍層：純 CSS 畫出來的星點紋理＋一個呼應網站自己 favicon「星圖」意象
// （圓圈＋經緯線＋金點，定義在 src/lib/iconArt.tsx）的大型線稿圖案，不是照片、不是插畫。
//
// Phase 1：淡入（進場動畫的第一個圖層）。
// Phase 2（這裡）：加上整體極緩慢旋轉、星點呼吸閃爍——兩者都是自動播放的無限迴圈動畫，
// 純 CSS keyframes 做，時間／透明度數值從 motionConfig.ts 讀，不寫死在這裡。
// 使用者開啟「減少動態效果」時，這兩個迴圈動畫會整個關掉，只留下 Phase 1 的靜態淡入結果。
//
// 純裝飾用途，加上 aria-hidden 跟 pointer-events-none，不影響任何操作與無障礙閱讀順序。
export default function HeroBackdrop() {
  const reducedMotion = usePrefersReducedMotion();
  const { rotationDurationSec, twinkleDurationSec, twinkleMinOpacity, twinkleMaxOpacity, baseOpacity } =
    motionConfig.backdrop;

  const dotsStyle = {
    "--hero-twinkle-min": twinkleMinOpacity,
    "--hero-twinkle-max": twinkleMaxOpacity,
    "--hero-twinkle-duration": `${twinkleDurationSec}s`,
    opacity: reducedMotion ? baseOpacity : undefined, // 減少動態效果時固定用一個安靜的透明度，不閃爍
  } as CSSProperties;

  const ringStyle = {
    "--hero-rotate-duration": `${rotationDurationSec}s`,
  } as CSSProperties;

  return (
    <div aria-hidden className="hero-backdrop pointer-events-none absolute inset-0 overflow-hidden">
      {/* 星點紋理：CSS radial-gradient 重複產生的點陣，不是圖片 */}
      <div
        className={`hero-backdrop__dots absolute inset-0 ${reducedMotion ? "" : "hero-backdrop__dots--twinkling"}`}
        style={dotsStyle}
      />

      {/* 呼應品牌 favicon 的圓圈＋經緯線圖案，刻意放大、偏移到右側，一部分延伸出畫面外，
          營造「畫面之外還有更大一張星圖」的感覺，而不是置中的具象占星輪盤插畫。
          整體極緩慢旋轉，一圈是分鐘等級（見 motionConfig.backdrop.rotationDurationSec）。 */}
      <svg
        className={`hero-backdrop__ring absolute -right-[18%] -top-[22%] h-[85%] w-[85%] sm:-right-[10%] sm:h-[110%] sm:w-[110%] ${
          reducedMotion ? "" : "hero-backdrop__ring--rotating"
        }`}
        style={ringStyle}
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="170" stroke="var(--color-mist-gold)" strokeWidth="0.75" opacity="0.5" />
        <circle cx="200" cy="200" r="120" stroke="var(--color-mist-blue)" strokeWidth="0.5" opacity="0.4" />
        <ellipse
          cx="200"
          cy="200"
          rx="60"
          ry="170"
          stroke="var(--color-mist-gold)"
          strokeWidth="0.5"
          opacity="0.35"
        />
        <line x1="30" y1="200" x2="370" y2="200" stroke="var(--color-mist-gold)" strokeWidth="0.5" opacity="0.35" />
        <circle cx="200" cy="200" r="3" fill="var(--color-mist-gold)" opacity="0.6" />
      </svg>
    </div>
  );
}
