"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import HeroBackdrop from "./HeroBackdrop";
import { motionConfig } from "@/lib/motionConfig";
import { useHeroParallax } from "@/lib/useHeroParallax";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

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

// 首頁 Hero：視覺、文案、排版跟原本完全一樣，這裡只新增「背景氛圍層」「依序淡入浮現」的
// 進場動畫，以及桌機才有的滑鼠視差。所有動畫數值都從 src/lib/motionConfig.ts 讀取，
// 不在這裡寫死任何時間或位移數字。
export default function HeroSection({ systemsCount, regionCount }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  // 這兩個 ref 各自是獨立的 wrapper，專門給滑鼠視差的 JS 直接改 transform 用，
  // 跟裡面負責進場動畫／自動旋轉的 CSS animation 分開在不同的 DOM 節點，避免兩者互搶
  // transform 屬性（CSS animation 在 forwards 模式下會持續蓋掉同一個元素的 inline transform）。
  const backdropParallaxRef = useRef<HTMLDivElement>(null);
  const contentParallaxRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useHeroParallax({
    sectionRef,
    backdropRef: backdropParallaxRef,
    contentRef: contentParallaxRef,
    enabled: !reducedMotion,
  });

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <div ref={backdropParallaxRef} className="absolute inset-0">
        <div className="hero-fade-item absolute inset-0" style={fadeStyle(0)}>
          <HeroBackdrop />
        </div>
      </div>

      <div
        ref={contentParallaxRef}
        className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-24"
      >
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
