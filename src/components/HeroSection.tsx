"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import HeroBackdrop from "./HeroBackdrop";
import { motionConfig } from "@/lib/motionConfig";

interface HeroSectionProps {
  systemsCount: number;
  regionCount: number;
}

/** 依「第幾個依序出現的元素」算出這個元素的進場動畫延遲時間，交給 CSS 變數使用 */
function fadeStyle(order: number): CSSProperties {
  const { itemDurationMs, staggerMs, riseDistancePx, easing } = motionConfig.entrance;
  return {
    "--hero-rise": `${riseDistancePx}px`,
    "--hero-duration": `${itemDurationMs}ms`,
    "--hero-delay": `${order * staggerMs}ms`,
    "--hero-easing": easing,
  } as CSSProperties;
}

// 首頁 Hero：視覺、文案、排版跟原本完全一樣，這裡只新增「背景氛圍層」跟「依序淡入浮現」的
// 進場動畫。所有動畫數值都從 src/lib/motionConfig.ts 讀取，不在這裡寫死任何時間或位移數字。
export default function HeroSection({ systemsCount, regionCount }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-fade-item absolute inset-0" style={fadeStyle(0)}>
        <HeroBackdrop />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-24">
        <p className="hero-fade-item text-sm tracking-widest text-mist-gold" style={fadeStyle(1)}>
          GLOBAL DIVINATION ATLAS
        </p>
        <h1
          className="hero-fade-item mt-4 font-serif text-[13vw] leading-[0.95] text-charcoal sm:text-6xl md:text-7xl"
          style={fadeStyle(2)}
        >
          GLOBAL
          <br />
          DIVINATION
          <br />
          ATLAS
        </h1>
        <div className="hero-fade-item" style={fadeStyle(3)}>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-charcoal-soft sm:text-base">
            {systemsCount}+ traditions · {regionCount}+ regions · One question.
          </p>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-charcoal-soft sm:text-base">
            From Chinese metaphysics to Vedic astrology, Tarot, Ifá, Geomancy and modern spiritual
            systems — explore how different cultures have interpreted fate, timing, relationships,
            and the unknown.
          </p>
        </div>

        <div className="hero-fade-item mt-8 flex flex-col gap-3 sm:flex-row" style={fadeStyle(4)}>
          <Link
            href="/analyzer"
            className="tap-target flex items-center justify-center rounded-full bg-charcoal px-6 py-3.5 text-[15px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            Ask My Question
          </Link>
          <Link
            href="/explore"
            className="tap-target flex items-center justify-center rounded-full border hairline bg-paper px-6 py-3.5 text-[15px] font-medium text-charcoal transition-colors hover:border-charcoal/50"
          >
            Explore All Systems
          </Link>
        </div>
      </div>
    </section>
  );
}
