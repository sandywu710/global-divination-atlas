"use client";

import { useMemo, useState } from "react";
import DrawInterface from "@/components/draw/DrawInterface";
import GeomancyInterface from "@/components/draw/GeomancyInterface";
import IChingCastInterface from "@/components/draw/IChingCastInterface";
import TossInterface from "@/components/draw/TossInterface";
import { toLiuYaoReadingResult } from "@/lib/randomDraw/liuyaoEngine";
import { buildComparisonPrompt, buildPrompt } from "@/lib/promptGenerator";
import { addPromptHistory, loadOtherPersonProfile, loadProfile, saveOtherPersonProfile, saveProfile } from "@/lib/storage";
import type { DivinationSystem, OtherPersonProfile, PromptMode, UserProfile } from "@/types/divination";
import type { ReadingResult } from "@/types/randomDraw";
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
  const [dreamDescription, setDreamDescription] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  // 擇日占星用：候選時段清單，預設先給 2 個空格子（比較「幾個」候選時段，至少要有 2 個才有意義）
  const [candidateMoments, setCandidateMoments] = useState<string[]>(["", ""]);
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [otherProfile, setOtherProfile] = useState<OtherPersonProfile>(() => loadOtherPersonProfile());
  const [mode, setMode] = useState<PromptMode>("Standard");
  const [prompt, setPrompt] = useState<string | null>(null);
  // key 是 system.id：這個系統要求真正抽牌時，存放使用者已經完成的抽牌結果
  const [drawResults, setDrawResults] = useState<Record<string, ReadingResult>>({});

  // 只顯示「這次選到的系統」實際會用到的欄位，避免使用者要填一大堆用不到的資料
  const neededFields = useMemo(() => {
    const set = new Set<string>();
    systems.forEach((s) => [...s.requiredInformation, ...(s.optionalInformation ?? [])].forEach((f) => set.add(f)));
    return set;
  }, [systems]);

  // Tarot / Lenormand / Runes / I Ching / 六爻 這類系統：要先在網站上真正抽完牌，才能繼續填資料、產生 Prompt
  const drawRequiredSystems = useMemo(() => systems.filter((s) => s.requiresRandomDraw), [systems]);
  const allDrawsComplete = drawRequiredSystems.every((s) => drawResults[s.id]);

  // 夢境占卜這類系統：requiredInformation 裡有 dreamDescription，代表這是必填資料，
  // 沒填就不能產生 Prompt（不然又會變回「有欄位但沒人填」的半成品狀態）
  const dreamDescriptionRequired = neededFields.has("dreamDescription");
  const dreamDescriptionMissing = dreamDescriptionRequired && !dreamDescription.trim();

  // 梅花易數／大六壬／奇門遁甲／卜卦占星／擇日占星這類系統：requiredInformation 裡有
  // context 或 specificEvent，代表需要使用者具體描述這件事，同樣是必填、沒填不能產生 Prompt
  const eventDescriptionRequired = neededFields.has("context") || neededFields.has("specificEvent");
  const eventDescriptionMissing = eventDescriptionRequired && !eventDescription.trim();

  // 奇門遁甲／卜卦占星：起局／提問當下的精確時間，由系統在使用者按下「產生 Prompt」的
  // 當下自動帶入，不是使用者自己填的欄位，這裡只需要知道「要不要帶」
  const castMomentNeeded = neededFields.has("castMoment");

  // 擇日占星：候選時段清單，至少要有 2 個已填的候選時段才有比較的意義
  const candidateMomentsRequired = neededFields.has("candidateMoments");
  const filledCandidateMoments = candidateMoments.map((m) => m.trim()).filter(Boolean);
  const candidateMomentsMissing = candidateMomentsRequired && filledCandidateMoments.length < 2;

  // 合盤占星：對方的出生資料，用獨立的一份表單蒐集（不強制必填，跟自己的出生資料一樣，
  // 沒填就在 Prompt 裡顯示 [Not provided]，維持跟其他出生資料欄位一致的行為）
  const otherPersonBirthDataNeeded = neededFields.has("otherPersonBirthData");

  function updateProfile(patch: Partial<UserProfile>) {
    const next = { ...profile, ...patch };
    setProfile(next);
    saveProfile(next);
  }

  function updateOtherProfile(patch: Partial<OtherPersonProfile>) {
    const next = { ...otherProfile, ...patch };
    setOtherProfile(next);
    saveOtherPersonProfile(next);
  }

  function updateCandidateMoment(index: number, value: string) {
    setCandidateMoments((prev) => prev.map((m, i) => (i === index ? value : m)));
  }

  function addCandidateMoment() {
    setCandidateMoments((prev) => [...prev, ""]);
  }

  function removeCandidateMoment(index: number) {
    // 至少留 2 個格子（少於 2 個候選時段，「比較哪個最好」這件事就沒有意義了）
    setCandidateMoments((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
  }

  function handleDrawComplete(systemId: string, result: ReadingResult) {
    setDrawResults((prev) => ({ ...prev, [systemId]: result }));
    setPrompt(null); // 抽牌結果變了，舊的 Prompt（如果有）已經跟畫面對不上，先清掉避免使用者誤用
  }

  function handleDrawReset(systemId: string) {
    setDrawResults((prev) => {
      const next = { ...prev };
      delete next[systemId];
      return next;
    });
    setPrompt(null);
  }

  function handleGenerate() {
    if (
      systems.length === 0 ||
      !allDrawsComplete ||
      dreamDescriptionMissing ||
      eventDescriptionMissing ||
      candidateMomentsMissing
    )
      return;

    // 起局時間只在真正要產生 Prompt 的這一刻抓，代表「提問當下」，不是頁面載入時的時間
    const castMoment = castMomentNeeded ? new Date().toISOString() : undefined;

    const result =
      systems.length === 1
        ? buildPrompt({
            system: systems[0],
            question,
            profile,
            mode,
            drawResult: drawResults[systems[0].id],
            dreamDescription,
            eventDescription,
            castMoment,
            candidateMoments: filledCandidateMoments,
            otherPersonProfile: otherProfile,
          })
        : buildComparisonPrompt(systems, question, profile, {
            drawResults,
            dreamDescription,
            eventDescription,
            castMoment,
            candidateMoments: filledCandidateMoments,
            otherPersonProfile: otherProfile,
          });
    setPrompt(result);
    addPromptHistory({ systemIds: systems.map((s) => s.id), question, prompt: result });
  }

  return (
    <div className="space-y-6">
      {drawRequiredSystems.map((s) => {
        const method = s.randomDraw?.randomizationMethod;
        if (method === "coin-toss-hexagram") {
          return (
            <IChingCastInterface
              key={s.id}
              system={s}
              question={question}
              onComplete={(result) => handleDrawComplete(s.id, result)}
              onReset={() => handleDrawReset(s.id)}
              buildReading={s.id === "liuyao" ? toLiuYaoReadingResult : undefined}
            />
          );
        }
        if (method === "object-toss") {
          return (
            <TossInterface
              key={s.id}
              system={s}
              question={question}
              onComplete={(result) => handleDrawComplete(s.id, result)}
              onReset={() => handleDrawReset(s.id)}
            />
          );
        }
        if (method === "geomantic-generation") {
          return (
            <GeomancyInterface
              key={s.id}
              system={s}
              question={question}
              onComplete={(result) => handleDrawComplete(s.id, result)}
              onReset={() => handleDrawReset(s.id)}
            />
          );
        }
        return (
          <DrawInterface
            key={s.id}
            system={s}
            question={question}
            onComplete={(result) => handleDrawComplete(s.id, result)}
            onReset={() => handleDrawReset(s.id)}
          />
        );
      })}

      {!allDrawsComplete && drawRequiredSystems.length > 0 && (
        <p className="rounded-2xl border hairline bg-ivory-soft p-5 text-sm text-charcoal-soft">
          先完成上面的抽牌，才會出現填資料與產生 Prompt 的區塊。
        </p>
      )}

      {allDrawsComplete && (
        <>
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

      {dreamDescriptionRequired && (
        <div>
          <label className="mb-2 block text-sm font-medium text-charcoal">請描述你的夢境</label>
          <textarea
            value={dreamDescription}
            onChange={(e) => setDreamDescription(e.target.value)}
            rows={5}
            placeholder="請盡量描述細節：夢裡出現了誰／什麼場景／發生了什麼事／醒來時的感覺，這段文字會完整放進 Prompt 裡"
            className="w-full rounded-2xl border hairline bg-paper px-4 py-3 text-[15px] text-charcoal placeholder:text-charcoal-soft/60 focus:border-charcoal focus:outline-none"
          />
          {dreamDescriptionMissing && (
            <p className="mt-1.5 text-xs text-accent-red">這個系統需要先描述夢境內容，才能產生 Prompt。</p>
          )}
        </div>
      )}

      {eventDescriptionRequired && (
        <div>
          <label className="mb-2 block text-sm font-medium text-charcoal">請具體描述這件事的來龍去脈</label>
          <textarea
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            rows={4}
            placeholder="例如：什麼時候發生的、跟誰有關、目前卡在哪裡、你想知道的具體結果是什麼——這段文字會完整放進 Prompt 裡"
            className="w-full rounded-2xl border hairline bg-paper px-4 py-3 text-[15px] text-charcoal placeholder:text-charcoal-soft/60 focus:border-charcoal focus:outline-none"
          />
          {eventDescriptionMissing && (
            <p className="mt-1.5 text-xs text-accent-red">這個系統需要先具體描述這件事，才能產生 Prompt。</p>
          )}
        </div>
      )}

      {castMomentNeeded && (
        <p className="rounded-2xl border hairline bg-ivory-soft p-4 text-xs text-charcoal-soft">
          這個系統需要「提問當下的精確時間」，按下「產生 Prompt」時會自動帶入當下的系統時間，不需要你自己輸入。
        </p>
      )}

      {candidateMomentsRequired && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-charcoal">候選時段（至少 2 個）</label>
            <button
              type="button"
              onClick={addCandidateMoment}
              className="tap-target text-xs text-mist-gold underline underline-offset-2 hover:opacity-80"
            >
              ＋ 新增候選時段
            </button>
          </div>
          <div className="space-y-2">
            {candidateMoments.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={m}
                  onChange={(e) => updateCandidateMoment(i, e.target.value)}
                  className="w-full rounded-xl border hairline bg-paper px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
                />
                {candidateMoments.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeCandidateMoment(i)}
                    className="tap-target shrink-0 text-xs text-charcoal-soft underline underline-offset-2 hover:text-charcoal"
                  >
                    移除
                  </button>
                )}
              </div>
            ))}
          </div>
          {candidateMomentsMissing && (
            <p className="mt-1.5 text-xs text-accent-red">至少需要填 2 個候選時段，才能產生 Prompt。</p>
          )}
        </div>
      )}

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
      </div>

      {otherPersonBirthDataNeeded && (
        <div className="rounded-2xl border hairline bg-paper p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal">對方的基本資料</p>
            <p className="text-xs text-charcoal-soft">只存在你的瀏覽器裡，之後會自動帶入</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="對方出生日期">
              <input
                type="date"
                value={otherProfile.birthDate ?? ""}
                onChange={(e) => updateOtherProfile({ birthDate: e.target.value })}
                className="w-full rounded-xl border hairline bg-ivory px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </Field>
            <Field label="對方出生時間">
              <input
                type="time"
                value={otherProfile.birthTime ?? ""}
                onChange={(e) => updateOtherProfile({ birthTime: e.target.value })}
                className="w-full rounded-xl border hairline bg-ivory px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </Field>
            <Field label="對方出生地">
              <input
                value={otherProfile.birthPlace ?? ""}
                onChange={(e) => updateOtherProfile({ birthPlace: e.target.value })}
                placeholder="例如：台北市"
                className="w-full rounded-xl border hairline bg-ivory px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </Field>
          </div>
        </div>
      )}

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
        disabled={
          systems.length === 0 ||
          !allDrawsComplete ||
          dreamDescriptionMissing ||
          eventDescriptionMissing ||
          candidateMomentsMissing
        }
        className="tap-target w-full rounded-full bg-mist-gold px-6 py-3.5 text-[15px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
      >
        產生 Prompt
      </button>
        </>
      )}

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
