import type { HexagramLine } from "@/lib/randomDraw/ichingEngine";

interface HexagramLineBarProps {
  line: HexagramLine | null; // null = 這一爻還沒擲
  label: string;
  actionable: boolean; // 是不是「接下來該擲的那一爻」
  onToss: () => void;
}

// 一爻的視覺呈現：陽爻是一整條實線，陰爻是中間斷開的兩段（傳統爻畫法）。
// 變爻（老陰／老陽）在右側加一個金色圓點標記，永遠正立好讀的文字說明放在右邊。
export default function HexagramLineBar({ line, label, actionable, onToss }: HexagramLineBarProps) {
  if (!line) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 rounded-sm border border-dashed border-line" />
        {actionable ? (
          <button
            type="button"
            onClick={onToss}
            className="tap-target shrink-0 rounded-full bg-charcoal px-4 py-2 text-xs font-medium text-ivory transition-opacity hover:opacity-90"
          >
            擲筊（Toss）
          </button>
        ) : (
          <span className="w-[92px] shrink-0 text-center text-xs text-charcoal-soft/50">{label}</span>
        )}
      </div>
    );
  }

  const isYang = line.yinYang === "yang";

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-3 flex-1 items-center gap-2">
        {isYang ? (
          <span className="h-full flex-1 rounded-sm bg-charcoal" />
        ) : (
          <>
            <span className="h-full flex-1 rounded-sm bg-charcoal" />
            <span className="h-full flex-1 rounded-sm bg-charcoal" />
          </>
        )}
      </div>
      <span className="w-[92px] shrink-0 text-xs text-charcoal-soft">
        {isYang ? "陽" : "陰"} {line.value}
        {line.changing && <span className="ml-1 text-mist-gold">● 變爻</span>}
      </span>
    </div>
  );
}
