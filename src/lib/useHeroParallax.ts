"use client";

import { useEffect, type RefObject } from "react";
import { motionConfig } from "./motionConfig";

interface UseHeroParallaxOptions {
  /** Hero 區塊本身，用來算滑鼠相對位置、判斷有沒有捲出畫面 */
  sectionRef: RefObject<HTMLElement | null>;
  /** 背景氛圍層的外層 wrapper（位移幅度較大） */
  backdropRef: RefObject<HTMLElement | null>;
  /** 標題／CTA 內容區塊的外層 wrapper（位移幅度較小，保持文字穩定好讀） */
  contentRef: RefObject<HTMLElement | null>;
  /** false 時完全不掛任何事件監聽、不啟動 requestAnimationFrame（例如減少動態效果開啟時） */
  enabled: boolean;
}

/**
 * 滑鼠視差 ＋ 捲動過場，只在「有滑鼠的裝置」（pointer: fine，桌機／滑鼠板）啟用，
 * 觸控裝置完全不掛任何事件監聽，不浪費效能。
 *
 * 效能設計：
 * - 只用 requestAnimationFrame + 直接改 DOM ref 的 transform（不透過 React state），
 *   避免每一幀都觸發 re-render
 * - 只用 translate3d（GPU 合成），不改 top/left，不觸發 layout
 * - 往下捲動離開 Hero 時，位移量會依 motionConfig.scrollFade 線性減弱到 0，
 *   避免捲到下一個區塊時視差還在背景搶注意力
 */
export function useHeroParallax({ sectionRef, backdropRef, contentRef, enabled }: UseHeroParallaxOptions) {
  useEffect(() => {
    if (!enabled) return;

    const section = sectionRef.current;
    const backdrop = backdropRef.current;
    const content = contentRef.current;
    if (!section || !backdrop || !content) return;

    // 只在「有滑鼠」的裝置上啟用；觸控裝置（手機／平板）沒有 hover 游標，直接跳過整個效果
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) return;

    const { backdropMaxOffsetPx, contentMaxOffsetPx, smoothing } = motionConfig.parallax;
    const { fullyFadedAtPx } = motionConfig.scrollFade;

    let targetX = 0; // -1 ~ 1，滑鼠在 Hero 內的水平位置（0 = 正中央）
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let scrollFactor = 1; // 1 = 完全在 Hero 範圍內，0 = 已經捲到動態該完全停止的程度
    let rafId = 0;

    function handlePointerMove(e: PointerEvent) {
      const rect = section!.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      // clamp 在 -1 ~ 1，確保就算滑鼠移到 Hero 邊緣外也不會算出誇張的位移量
      targetX = Math.max(-1, Math.min(1, relX * 2));
      targetY = Math.max(-1, Math.min(1, relY * 2));
    }

    function handlePointerLeave() {
      targetX = 0;
      targetY = 0;
    }

    function handleScroll() {
      const scrollY = window.scrollY;
      scrollFactor = Math.max(0, Math.min(1, 1 - scrollY / fullyFadedAtPx));
    }

    function tick() {
      // 用 lerp 讓位移平滑跟上滑鼠，而不是瞬間跳過去
      currentX += (targetX - currentX) * smoothing;
      currentY += (targetY - currentY) * smoothing;

      const appliedX = currentX * scrollFactor;
      const appliedY = currentY * scrollFactor;

      // 兩層都跟滑鼠反方向位移（經典視差感），背景層幅度較大、文字層較小，
      // 位移幅度有明確上限（motionConfig.parallax），不會讓元素跑出版面或蓋到文字
      backdrop!.style.transform = `translate3d(${(-appliedX * backdropMaxOffsetPx).toFixed(2)}px, ${(
        -appliedY * backdropMaxOffsetPx
      ).toFixed(2)}px, 0)`;
      content!.style.transform = `translate3d(${(-appliedX * contentMaxOffsetPx).toFixed(2)}px, ${(
        -appliedY * contentMaxOffsetPx
      ).toFixed(2)}px, 0)`;

      rafId = requestAnimationFrame(tick);
    }

    section.addEventListener("pointermove", handlePointerMove);
    section.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // 先算一次目前的捲動位置，避免第一幀用錯的初始值閃一下
    rafId = requestAnimationFrame(tick);

    return () => {
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
      // 卸載或效果被關閉時，把位移重置乾淨，不留殘留的 transform
      backdrop.style.transform = "";
      content.style.transform = "";
    };
  }, [enabled, sectionRef, backdropRef, contentRef]);
}
