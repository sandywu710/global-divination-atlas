// 共用的「星等」小元件，1-5 顆星，用實心／空心圓點呈現（比 emoji 星星更貼近編輯誌質感）
export default function Stars({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="flex items-center gap-1.5" aria-label={label ?? `適合度 ${clamped} / 5`}>
      <div className="flex gap-[3px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`inline-block h-[7px] w-[7px] rounded-full ${
              i < clamped ? "bg-mist-gold" : "bg-line"
            }`}
          />
        ))}
      </div>
      {label && <span className="text-xs text-charcoal-soft">{label}</span>}
    </div>
  );
}
