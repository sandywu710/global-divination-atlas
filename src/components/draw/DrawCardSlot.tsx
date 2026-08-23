"use client";

import type { DeckItem, DrawResult } from "@/types/randomDraw";
import CardBack from "./CardBack";
import CardFace from "./CardFace";

interface DrawCardSlotProps {
  item: DeckItem;
  result: DrawResult;
  flipped: boolean;
  onFlip: () => void;
}

// 一個牌陣位置：牌背 → 點擊 → 簡單的 CSS 3D 翻牌動畫 → 牌面。
// 抽牌結果（result）在呼叫這個元件之前就已經由 Random Draw Engine 決定好了，
// 這裡純粹負責「翻開／顯示」，點擊不會重新決定抽到什麼牌。
export default function DrawCardSlot({ item, result, flipped, onFlip }: DrawCardSlotProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full [perspective:1000px]">
        <div
          className={`relative w-full transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* 牌背（正面朝上顯示，尚未翻開時看得到） */}
          <div className="[backface-visibility:hidden]">
            <CardBack onClick={onFlip} disabled={flipped} label={result.positionLabel} />
          </div>
          {/* 牌面（翻轉 180 度後才會朝向使用者） */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <CardFace item={item} reversed={result.reversed} positionLabel={result.positionLabel} />
          </div>
        </div>
      </div>

      {/* 永遠正立的文字說明：牌名 + 正位／逆位，逆位時卡面本身是上下顛倒的，這裡才是好讀的版本。
          result.reversed 是 undefined 代表這套牌組根本不看正逆位（例如 Lenormand），
          這時候不該顯示「正位」，因為那個概念在這套牌組裡不成立。 */}
      <p className="min-h-[1.25rem] text-center text-xs text-charcoal-soft">
        {flipped
          ? `${result.itemName}${result.reversed === undefined ? "" : result.reversed ? " · 逆位 Reversed" : " · 正位 Upright"}`
          : ""}
      </p>
    </div>
  );
}
