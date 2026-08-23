"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motionConfig } from "@/lib/motionConfig";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

interface CardSpec {
  src: string;
  /** 位置＋顯示大小，響應式（手機／平板／桌機各自的座標與尺寸） */
  positionClassName: string;
  rotateDeg: number;
  zIndex: number;
  priority?: boolean;
  /** 手機版是否隱藏（畫面太擠時，只留 2 張卡片） */
  hiddenOnMobile?: boolean;
}

// 3 張卡片疊在星盤左側、彼此稍微交疊，位置參考 mock-hero-preview.jpg 的相對排法，
// 但實際座標依現在 Hero 版面的比例調整過（原示意圖的卡牌位置在我們的版面裡是文字欄位）。
const cards: CardSpec[] = [
  {
    src: "/hero/tarot-card-a.webp",
    positionClassName:
      "left-[48%] top-[73%] w-14 sm:left-[63%] sm:top-[28%] sm:w-20 md:left-[70%] md:top-[24%] md:w-20 lg:left-[55%] lg:top-[26%] lg:w-28",
    rotateDeg: -8,
    zIndex: 3,
    priority: true,
  },
  {
    src: "/hero/tarot-card-b.webp",
    positionClassName:
      "left-[63%] top-[77%] w-14 sm:left-[73%] sm:top-[34%] sm:w-20 md:left-[80%] md:top-[30%] md:w-20 lg:left-[65%] lg:top-[32%] lg:w-28",
    rotateDeg: 6,
    zIndex: 2,
  },
  {
    src: "/hero/tarot-card-c.webp",
    positionClassName:
      "left-[59%] top-[52%] w-20 sm:left-[68%] sm:top-[48%] sm:w-20 md:left-[75%] md:top-[42%] md:w-20 lg:left-[59%] lg:top-[48%] lg:w-28",
    rotateDeg: -3,
    zIndex: 1,
    hiddenOnMobile: true,
  },
];

// 3 張塔羅卡牌漂浮圖層：每張卡片外層負責「固定位置＋固定小角度傾斜」，
// 內層負責「漂浮動畫」——兩個關注點分開放在不同 DOM 節點，才不會互搶 transform 屬性
// （跟 HeroSection.tsx 分離視差 wrapper／CSS animation wrapper 是同樣的原因，見那個檔案的註解）。
// 手機版只留 2 張（隱藏交疊最多、視覺上非必要的第三張），避免畫面太擠。
export default function HeroTarotCards() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {cards.map((card, i) => {
        const { amplitudePx, durationSec, delayMs } = motionConfig.cards.items[i];
        const floatStyle = {
          "--hero-card-amplitude": `${amplitudePx}px`,
          "--hero-card-duration": `${durationSec}s`,
          "--hero-card-delay": `${delayMs}ms`,
        } as CSSProperties;

        return (
          <div
            key={card.src}
            className={`absolute ${card.positionClassName} ${card.hiddenOnMobile ? "hidden sm:block" : ""}`}
            style={{ transform: `rotate(${card.rotateDeg}deg)`, zIndex: card.zIndex }}
          >
            <div className={reducedMotion ? "" : "hero-card-float"} style={floatStyle}>
              <Image
                src={card.src}
                alt=""
                width={427}
                height={640}
                priority={card.priority}
                sizes="(min-width: 1024px) 112px, (min-width: 640px) 96px, 80px"
                className="h-auto w-full shadow-[0_8px_24px_rgba(42,41,38,0.18)]"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
