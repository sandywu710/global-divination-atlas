"use client";

import { useState } from "react";
import { allBestFor, allCategories, allRegions, bestForLabels, categoryLabels, regionLabels } from "@/data/categories";

export interface FilterState {
  search: string;
  regions: string[];
  categories: string[];
  bestFor: string[];
}

interface FilterBarProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  resultCount: number;
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FilterChips({
  title,
  options,
  labels,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  labels: Record<string, string>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-wide text-charcoal-soft">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`tap-target rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-line bg-paper text-charcoal-soft hover:border-charcoal/50"
              }`}
            >
              {labels[opt] ?? opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// /explore 頁面的篩選面板。手機上預設收合成一個可展開的面板，桌面版直接展開常駐。
export default function FilterBar({ value, onChange, resultCount }: FilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = value.regions.length + value.categories.length + value.bestFor.length;

  const panel = (
    <div className="space-y-5 rounded-2xl border hairline bg-paper p-5">
      <FilterChips
        title="地區 Region"
        options={allRegions}
        labels={regionLabels}
        selected={value.regions}
        onToggle={(v) => onChange({ ...value, regions: toggleValue(value.regions, v) })}
      />
      <FilterChips
        title="分類 Category"
        options={allCategories}
        labels={categoryLabels}
        selected={value.categories}
        onToggle={(v) => onChange({ ...value, categories: toggleValue(value.categories, v) })}
      />
      <FilterChips
        title="適合探索 Best For"
        options={allBestFor}
        labels={bestForLabels}
        selected={value.bestFor}
        onToggle={(v) => onChange({ ...value, bestFor: toggleValue(value.bestFor, v) })}
      />
      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => onChange({ ...value, regions: [], categories: [], bestFor: [] })}
          className="tap-target text-sm text-accent-red underline underline-offset-2"
        >
          清除所有篩選（{activeCount}）
        </button>
      )}
    </div>
  );

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-3">
        <input
          type="search"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="搜尋系統名稱、地區、關鍵字（例如 Career、Love、前世）"
          className="tap-target w-full rounded-full border hairline bg-paper px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-charcoal focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="tap-target flex shrink-0 items-center gap-1.5 rounded-full border hairline bg-paper px-4 py-2.5 text-sm text-charcoal sm:hidden"
        >
          篩選{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      </div>

      <div className={`${mobileOpen ? "block" : "hidden"} sm:block`}>{panel}</div>

      <p className="mt-4 text-sm text-charcoal-soft">共 {resultCount} 個系統</p>
    </div>
  );
}
