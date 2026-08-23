"use client";

// 牌背：點擊後由父層（DrawCardGrid）觸發翻牌。純展示 + 點擊事件，不含任何抽牌邏輯。
export default function CardBack({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label ? `翻開：${label}` : "翻牌"}
      className="tap-target group flex aspect-[2/3] w-full flex-col items-center justify-center rounded-xl border-2 border-charcoal bg-charcoal shadow-sm transition-transform disabled:cursor-default disabled:opacity-50 enabled:hover:-translate-y-1"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-mist-gold/70">
        <span className="h-2 w-2 rotate-45 bg-mist-gold" />
      </span>
      {label && <span className="mt-3 px-2 text-center text-[11px] tracking-wide text-ivory/70">{label}</span>}
    </button>
  );
}
