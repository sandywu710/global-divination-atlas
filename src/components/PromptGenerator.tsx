"use client";

import { useMemo, useState } from "react";
import { buildComparisonPrompt, buildPrompt } from "@/lib/promptGenerator";
import { addPromptHistory, loadProfile, saveProfile } from "@/lib/storage";
import type { DivinationSystem, PromptMode, UserProfile } from "@/types/divination";
import PromptPreview from "./PromptPreview";

const modes: PromptMode[] = ["Quick", "Standard", "Deep Research", "Expert"];
const modeLabels: Record<PromptMode, string> = {
  Quick: "快速",
  Standard: "標準",
  "Deep Research": "深度研究",
  Expert: "專家模式",
};

interface PromptGeneratorProps {
  systems: DivinationSystem[];
  initialQuestion?: string;
}

// 選好系統之後，這個元件負責：填個人資料（存 LocalStorage，之後自動帶入）、
// 選 Prompt 模式、產生 Prompt、顯示複製框。單一系統或多系統比較都用同一個元件。
export default function PromptGenerator({ systems, initialQuestion = "" }: PromptGeneratorProps) {
  // 用 lazy initializer 而不是 useEffect：profile 只存在瀏覽器裡，
  // 這樣掛載當下就能拿到正確的值，畫面不會先閃一次空白再補上。
  const [question, setQuestion] = useState(initialQuestion);
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [mode, setMode] = useState<PromptMode>("Standard");
  const [prompt, setPrompt] = useState<string | null>(null);

  // 只顯示「這次選到的系統」實際會用到的欄位，避免使用者要填一大堆用不到的資料
  const neededFields = useMemo(() => {
    const set = new Set<string>();
    systems.forEach((s) => [...s.requiredInformation, ...(s.optionalInformation ?? [])].forEach((f) => set.add(f)));
    return set;
  }, [systems]);

  function updateProfile(patch: Partial<UserProfile>) {
    const next = { ...profile, ...patch };
    setProfile(next);
    saveProfile(next);
  }

  function handleGenerate() {
    if (systems.length === 0) return;
    const result =
      systems.length === 1
        ? buildPrompt({ system: systems[0], question, profile, mode })
        : buildComparisonPrompt(systems, question, profile);
    setPrompt(result);
    addPromptHistory({ systemIds: systems.map((s) => s.id), question, prompt: result });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-charcoal">你的問題</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="例如：我今年適合換工作嗎？"
          className="w-full rounded-2xl border hairline bg-paper px-4 py-3 text-[15px] text-charcoal placeholder:text-charcoal-soft/60 focus:border-charcoal focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border hairline bg-paper p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-charcoal">你的基本資料</p>
          <p className="text-xs text-charcoal-soft">只存在你的瀏覽器裡，之後會自動帶入</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {neededFields.has("name") || neededFields.has("fullName") ? (
            <Field label="姓名">
              <input
                value={profile.name ?? ""}
                onChange={(e) => updateProfile({ name: e.target.value })}
                className="w-full rounded-xl border hairline bg-ivory px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </Field>
          ) : null}
          {neededFields.has("birthDate") && (
            <Field label="出生日期">
              <input
                type="date"
                value={profile.birthDate ?? ""}
                onChange={(e) => updateProfile({ birthDate: e.target.value })}
                className="w-full rounded-xl border hairline bg-ivory px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </Field>
          )}
          {neededFields.has("birthTime") && (
            <Field label="出生時間">
              <input
                type="time"
                value={profile.birthTime ?? ""}
                onChange={(e) => updateProfile({ birthTime: e.target.value })}
                className="w-full rounded-xl border hairline bg-ivory px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </Field>
          )}
          {neededFields.has("birthPlace") && (
            <Field label="出生地">
              <input
                value={profile.birthPlace ?? ""}
                onChange={(e) => updateProfile({ birthPlace: e.target.value })}
                placeholder="例如：台北市"
                className="w-full rounded-xl border hairline bg-ivory px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </Field>
          )}
          {neededFields.has("currentLocation") && (
            <Field label="目前所在地">
              <input
                value={profile.currentLocation ?? ""}
                onChange={(e) => updateProfile({ currentLocation: e.target.value })}
                className="w-full rounded-xl border hairline bg-ivory px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </Field>
          )}
          {neededFields.has("gender") && (
            <Field label="性別（可略過）">
              <input
                value={profile.gender ?? ""}
                onChange={(e) => updateProfile({ gender: e.target.value })}
                className="w-full rounded-xl border hairline bg-ivory px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </Field>
          )}
          {neededFields.has("relationshipStatus") && (
            <Field label="感情狀態（可略過）">
              <input
                value={profile.relationshipStatus ?? ""}
                onChange={(e) => updateProfile({ relationshipStatus: e.target.value })}
                className="w-full rounded-xl border hairline bg-ivory px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </Field>
          )}
        </div>
        {neededFields.has("otherPersonBirthData") && (
          <p className="mt-3 text-xs text-charcoal-soft">
            這個系統需要對方的出生資料，產生 Prompt 後可以直接在文字裡手動補上。
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-charcoal">Prompt 模式</p>
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`tap-target rounded-full border px-4 py-2 text-sm transition-colors ${
                mode === m
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-line bg-paper text-charcoal-soft hover:border-charcoal/50"
              }`}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={systems.length === 0}
        className="tap-target w-full rounded-full bg-mist-gold px-6 py-3.5 text-[15px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
      >
        產生 Prompt
      </button>

      {prompt && <PromptPreview prompt={prompt} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-charcoal-soft">{label}</span>
      {children}
    </label>
  );
}
