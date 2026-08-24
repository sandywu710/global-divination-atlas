import Link from "next/link";
import { categoryLabels, regionLabels } from "@/data/categories";
import { getSystemById } from "@/data/systems";
import type { DivinationSystem } from "@/types/divination";
import Stars from "./Stars";

const exploreLabels: Record<string, string> = {
  Personality: "個性",
  "Life Pattern": "人生模式",
  Career: "事業",
  Money: "金錢",
  Love: "感情",
  Marriage: "婚姻",
  Relationships: "關係",
  Family: "家庭",
  "Health Symbolism": "健康象徵",
  Decision: "決策",
  Timing: "時機",
  "Future Trends": "未來趨勢",
  "Specific Event": "具體事件",
  Past: "過去",
  "Past Life": "前世",
  Karma: "業力／因果",
  "Soul Purpose": "靈魂使命",
  "Spiritual Growth": "靈性成長",
  "Life Mission": "人生使命",
  Shadow: "陰影",
  "Inner World": "內在世界",
  Energy: "能量",
  Dreams: "夢境",
};

const infoLabels: Record<string, string> = {
  birthDate: "出生日期",
  birthTime: "精確出生時間",
  birthPlace: "出生地",
  currentLocation: "目前所在地",
  question: "具體問題",
  gender: "性別",
  relationshipStatus: "感情狀態",
  partnerBirthData: "伴侶出生資料",
  otherPersonBirthData: "對方出生資料",
  photo: "照片",
  handPhoto: "手部照片",
  dreamDescription: "夢境描述",
  randomSelection: "隨機抽取結果",
  cards: "抽牌結果",
  dice: "擲骰結果",
  context: "情境描述",
  specificEvent: "具體事件",
  name: "姓名",
  fullName: "全名",
  castMoment: "提問當下的精確時間（自動帶入）",
  candidateMoments: "候選時段清單",
};

const claimLabels: Record<DivinationSystem["spiritualClaimLevel"], string> = {
  symbolic: "象徵性框架 — 純粹作為反思與聯想工具",
  traditional: "傳統詮釋框架 — 依循歷史流傳的方法論，非科學驗證",
  spiritual: "靈性信念框架 — 涉及業力／前世等信念，已在 Prompt 中加註明確警語",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t hairline py-6 first:border-t-0 first:pt-0">
      <h2 className="mb-3 font-serif text-lg text-charcoal">{title}</h2>
      {children}
    </section>
  );
}

export default function SystemDetail({ system }: { system: DivinationSystem }) {
  const related = (system.relatedSystems ?? []).map((id) => getSystemById(id)).filter(Boolean) as DivinationSystem[];

  return (
    <article>
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {system.region.map((r) => (
            <span key={r} className="rounded-full bg-ivory-soft px-2.5 py-0.5 text-xs text-charcoal-soft">
              {regionLabels[r] ?? r}
            </span>
          ))}
          {system.category.map((c) => (
            <span key={c} className="rounded-full bg-ivory-soft px-2.5 py-0.5 text-xs text-mist-blue">
              {categoryLabels[c] ?? c}
            </span>
          ))}
        </div>
        <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">{system.name}</h1>
        {system.nativeNames && system.nativeNames.length > 0 && (
          <p className="mt-1 text-[15px] text-charcoal-soft">{system.nativeNames.join(" · ")}</p>
        )}
        <p className="mt-1 text-sm text-charcoal-soft">
          {system.culturalOrigin}
          {system.era ? ` ・ ${system.era}` : ""}
        </p>
        <div className="mt-4">
          <Stars value={system.aiSuitability} label={`AI 適合度 ${system.aiSuitability} / 5`} />
        </div>
      </header>

      <Section title="這是什麼">
        <p className="text-[15px] leading-relaxed text-charcoal-soft">{system.description}</p>
      </Section>

      <Section title="可以探索什麼">
        <div className="flex flex-wrap gap-2">
          {system.whatItCanExplore.map((e) => (
            <span key={e} className="rounded-full border border-line px-3 py-1 text-sm text-charcoal-soft">
              {exploreLabels[e] ?? e}
            </span>
          ))}
        </div>
      </Section>

      <Section title="適合問的問題">
        <ul className="space-y-2">
          {system.idealQuestions.map((q, i) => (
            <li key={i} className="text-[15px] leading-relaxed text-charcoal-soft">
              「{q}」
            </li>
          ))}
        </ul>
      </Section>

      <Section title="需要準備的資料">
        <div className="flex flex-wrap gap-2">
          {system.requiredInformation.map((info) => (
            <span key={info} className="rounded-full bg-charcoal px-3 py-1 text-sm text-ivory">
              {infoLabels[info] ?? info}
            </span>
          ))}
          {system.optionalInformation?.map((info) => (
            <span key={info} className="rounded-full border border-line px-3 py-1 text-sm text-charcoal-soft">
              {infoLabels[info] ?? info}（可選）
            </span>
          ))}
        </div>
      </Section>

      <Section title="方法論摘要">
        <p className="text-[15px] leading-relaxed text-charcoal-soft">{system.methodologySummary}</p>
      </Section>

      <Section title="限制與注意事項">
        <p className="text-[15px] leading-relaxed text-charcoal-soft">{system.limitations}</p>
        <p className="mt-2 text-sm text-mist-blue">{claimLabels[system.spiritualClaimLevel]}</p>
      </Section>

      {related.length > 0 && (
        <Section title="相關系統">
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/system/${r.id}`}
                className="tap-target flex items-center rounded-full border border-line px-3 py-1.5 text-sm text-charcoal-soft hover:border-charcoal/40"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}
