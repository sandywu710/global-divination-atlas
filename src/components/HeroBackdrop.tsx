"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motionConfig } from "@/lib/motionConfig";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

// Hero 背景的氛圍層：星盤插畫（astro-wheel.webp）＋ 金色星塵插畫（gold-dust.webp）。
// 這兩張圖取代了原本用 CSS 畫的圓圈／經緯線／點狀紋理，但動畫機制完全沿用——
// class 名稱、旋轉／閃爍的 keyframe、reduced-motion／手機簡化的處理都沒有變，
// 只是把「CSS 畫的圖案」換成「Image 元件」。
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
      {/* 金色星塵：取代原本的 CSS 點狀紋理，鋪滿整個 Hero 背景 */}
      <Image
        src="/hero/gold-dust.webp"
        alt=""
        fill
        sizes="100vw"
        className={`hero-backdrop__dots object-cover ${reducedMotion ? "" : "hero-backdrop__dots--twinkling"}`}
        style={dotsStyle}
      />

      {/* 星盤插畫：取代原本用 CSS 畫的圓圈＋經緯線圖案，位置跟大小沿用原本的設定
          （偏移到右側、一部分延伸出畫面外），整體極緩慢旋轉（見 motionConfig.backdrop）。 */}
      <Image
        src="/hero/astro-wheel.webp"
        alt=""
        width={1254}
        height={1254}
        priority
        sizes="(min-width: 640px) 60vw, 85vw"
        className={`hero-backdrop__ring absolute -right-[14%] top-[68%] h-[38%] w-[70%] object-contain object-right opacity-60 sm:-right-[8%] sm:-top-[10%] sm:h-[78%] sm:w-[72%] sm:opacity-100 md:-right-[4%] md:-top-[6%] md:h-[68%] md:w-[58%] lg:-right-[6%] lg:-top-[8%] lg:h-[95%] lg:w-[85%] ${
          reducedMotion ? "" : "hero-backdrop__ring--rotating"
        }`}
        style={ringStyle}
      />
    </div>
  );
}
