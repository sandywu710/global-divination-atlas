"use client";

import { useMemo, useState } from "react";
import FilterBar, { type FilterState } from "@/components/FilterBar";
import SystemCard from "@/components/SystemCard";
import { systems } from "@/data/systems";

const emptyFilter: FilterState = { search: "", regions: [], categories: [], bestFor: [] };

export default function ExplorePage() {
  const [filter, setFilter] = useState<FilterState>(emptyFilter);

  const filtered = useMemo(() => {
    const q = filter.search.trim().toLowerCase();
    return systems.filter((s) => {
      if (filter.regions.length > 0 && !s.region.some((r) => filter.regions.includes(r))) return false;
      if (filter.categories.length > 0 && !s.category.some((c) => filter.categories.includes(c))) return false;
      if (filter.bestFor.length > 0 && !s.whatItCanExplore.some((e) => filter.bestFor.includes(e))) return false;
      if (q.length > 0) {
        const haystack = [
          s.name,
          ...(s.nativeNames ?? []),
          s.culturalOrigin,
          ...s.region,
          ...s.category,
          ...s.whatItCanExplore,
          s.description,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [filter]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">探索所有系統</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal-soft">
          50 個來自全球的占卜、命理與靈性系統。用地區、分類或想探索的主題篩選，或直接搜尋關鍵字。
        </p>
      </header>

      <FilterBar value={filter} onChange={setFilter} resultCount={filtered.length} />

      {filtered.length === 0 ? (
        <p className="rounded-2xl border hairline bg-paper p-8 text-center text-sm text-charcoal-soft">
          沒有符合條件的系統，試試看調整篩選條件或換個關鍵字。
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <SystemCard key={s.id} system={s} />
          ))}
        </div>
      )}
    </div>
  );
}
