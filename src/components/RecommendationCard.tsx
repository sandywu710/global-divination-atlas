import Link from "next/link";
import type { SystemRecommendation } from "@/lib/recommendation";
import Stars from "./Stars";

const infoLabels: Record<string, string> = {
  birthDate: "出生日期",
  birthTime: "出生時間",
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
};

interface RecommendationCardProps {
  recommendation: SystemRecommendation;
  selected: boolean;
  onToggle: (systemId: string) => void;
}

// /analyzer 推薦結果卡片：星等＋原因＋需要的資料＋是否勾選要一起產生 Prompt
export default function RecommendationCard({ recommendation, selected, onToggle }: RecommendationCardProps) {
  const { system, stars, reasons } = recommendation;

  return (
    <div
      className={`rounded-2xl border p-5 transition-colors sm:p-6 ${
        selected ? "border-charcoal bg-paper" : "hairline bg-paper"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/system/${system.id}`} className="font-serif text-lg text-charcoal hover:underline">
            {system.name}
          </Link>
          {system.nativeNames && system.nativeNames.length > 0 && (
            <p className="text-sm text-charcoal-soft">{system.nativeNames.join(" · ")}</p>
          )}
          <div className="mt-2">
            <Stars value={stars} label={`適合度 ${stars} / 5`} />
          </div>
        </div>
        <label className="tap-target flex shrink-0 cursor-pointer items-center gap-2 text-sm text-charcoal-soft">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle(system.id)}
            className="h-5 w-5 accent-mist-gold"
          />
          選用
        </label>
      </div>

      <ul className="mt-4 space-y-1 text-sm text-charcoal-soft">
        {reasons.map((r, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-mist-gold">・</span>
            {r}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {system.requiredInformation.map((info) => (
          <span key={info} className="rounded-full bg-ivory-soft px-2.5 py-0.5 text-xs text-charcoal-soft">
            需要：{infoLabels[info] ?? info}
          </span>
        ))}
      </div>
    </div>
  );
}
