import Link from "next/link";
import { categoryLabels, regionLabels } from "@/data/categories";
import type { DivinationSystem } from "@/types/divination";
import Stars from "./Stars";

// /explore 頁面用的系統卡片。手機一欄、平板兩欄、桌面三到四欄（由外層 grid 控制）。
export default function SystemCard({ system }: { system: DivinationSystem }) {
  return (
    <Link
      href={`/system/${system.id}`}
      className="tap-target group flex flex-col justify-between rounded-2xl border hairline bg-paper p-5 transition-colors hover:border-charcoal/40 sm:p-6"
    >
      <div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {system.region.map((r) => (
            <span key={r} className="rounded-full bg-ivory-soft px-2.5 py-0.5 text-xs text-charcoal-soft">
              {regionLabels[r] ?? r}
            </span>
          ))}
        </div>
        <h3 className="font-serif text-lg leading-snug text-charcoal group-hover:underline">{system.name}</h3>
        {system.nativeNames && system.nativeNames.length > 0 && (
          <p className="mt-0.5 text-sm text-charcoal-soft">{system.nativeNames.join(" · ")}</p>
        )}
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-charcoal-soft">{system.description}</p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {system.category.slice(0, 2).map((c) => (
            <span key={c} className="text-xs text-mist-blue">
              {categoryLabels[c] ?? c}
            </span>
          ))}
        </div>
        <Stars value={system.aiSuitability} />
      </div>
    </Link>
  );
}
