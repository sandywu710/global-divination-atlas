import type { DeckItem } from "@/types/randomDraw";

// 卡面圖示：原創的簡單幾何線條，不使用市售塔羅插畫（版權考量）。
// Major Arcana 用跟網站自己 favicon 一樣的「星圖」意象（圓＋經緯線＋金點），呼應品牌；
// 小阿爾克那依花色給一個對應的幾何符號。之後 Sandy 要換成正式美術素材，只要換這個檔案就好。
function CardGlyph({ item }: { item: DeckItem }) {
  const stroke = "var(--color-mist-gold)";

  // 有些牌組（例如符文）本身就是文字符號，直接顯示那個符號最貼切、也最忠於傳統——
  // 這是純文字，不是圖片，沒有版權疑慮。
  if (item.glyph) {
    return (
      <span className="text-4xl leading-none text-mist-gold" style={{ fontFamily: "serif" }} aria-hidden>
        {item.glyph}
      </span>
    );
  }

  if (item.arcana === "major") {
    return (
      <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
        <circle cx="24" cy="24" r="16" stroke={stroke} strokeWidth="1.5" />
        <ellipse cx="24" cy="24" rx="6" ry="16" stroke={stroke} strokeWidth="1.5" />
        <line x1="8" y1="24" x2="40" y2="24" stroke={stroke} strokeWidth="1.5" />
        <circle cx="24" cy="24" r="2.5" fill={stroke} />
      </svg>
    );
  }

  switch (item.suit) {
    case "wands":
      return (
        <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
          <polygon points="24,8 36,38 12,38" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "cups":
      return (
        <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
          <circle cx="24" cy="22" r="13" stroke={stroke} strokeWidth="1.5" />
          <line x1="24" y1="35" x2="24" y2="40" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case "swords":
      return (
        <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
          <line x1="24" y1="6" x2="24" y2="40" stroke={stroke} strokeWidth="1.5" />
          <line x1="14" y1="16" x2="34" y2="16" stroke={stroke} strokeWidth="1.5" />
          <polygon points="24,40 19,34 29,34" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "pentacles":
      return (
        <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
          <polygon
            points="24,7 39,18 33,36 15,36 9,18"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="24" r="4" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
          <rect x="14" y="14" width="20" height="20" transform="rotate(45 24 24)" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
  }
}

interface CardFaceProps {
  item: DeckItem;
  reversed?: boolean;
  positionLabel?: string;
}

// 翻開後的卡面本身：逆位時整張卡片視覺上上下顛倒（跟實體逆位牌一致的呈現方式）。
// 文字說明「正位／逆位」不放在卡面裡（顛倒時會很難讀），改由外層 DrawCardGrid
// 在卡片下方用永遠正立的文字顯示，兩者搭配才完整。
export default function CardFace({ item, reversed, positionLabel }: CardFaceProps) {
  return (
    <div
      className={`flex aspect-[2/3] w-full flex-col items-center justify-between rounded-xl border-2 border-charcoal bg-paper p-3 text-center shadow-sm transition-transform ${
        reversed ? "rotate-180" : ""
      }`}
    >
      <span className="text-[10px] uppercase tracking-wide text-charcoal-soft">{positionLabel ?? ""}</span>
      <CardGlyph item={item} />
      <p className="font-serif text-sm leading-tight text-charcoal">{item.name}</p>
    </div>
  );
}
