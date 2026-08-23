import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import SystemCard from "@/components/SystemCard";
import { systems } from "@/data/systems";

const regionCount = new Set(systems.flatMap((s) => s.region)).size;

// 首頁精選幾個具代表性、來自不同地區的系統做視覺展示
const highlightIds = ["bazi", "vedic-astrology", "rider-waite-tarot", "ifa", "human-design", "runes"];
const highlights = highlightIds.map((id) => systems.find((s) => s.id === id)).filter(Boolean) as typeof systems;

export default function Home() {
  return (
    <div>
      <HeroSection systemsCount={systems.length} regionCount={regionCount} />

      <section className="border-t hairline bg-ivory-soft px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">怎麼運作</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { step: "01", title: "問一個問題", desc: "用你自己的話輸入你現在最想知道的事，不用懂任何命理術語。" },
              { step: "02", title: "看推薦與原因", desc: "系統會列出最適合這類問題的傳統，並說明為什麼、需要準備什麼資料。" },
              { step: "03", title: "產生 Prompt", desc: "一鍵複製高品質英文 Prompt，貼到 ChatGPT、Gemini 或 Claude 裡使用。" },
            ].map((item) => (
              <div key={item.step}>
                <p className="font-serif text-3xl text-mist-gold">{item.step}</p>
                <h3 className="mt-2 text-[15px] font-medium text-charcoal">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal-soft">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">精選系統</h2>
          <Link href="/explore" className="text-sm text-charcoal-soft underline underline-offset-4">
            看全部 {systems.length} 個 →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((s) => (
            <SystemCard key={s.id} system={s} />
          ))}
        </div>
      </section>

      <section className="border-t hairline px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">這不是預測未來的 AI</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-charcoal-soft">
            這是一個全球知識導航工具，幫助你發現哪一套占卜或靈性框架最適合你的問題、了解需要準備什麼資料，
            並產生一個高品質的 Prompt 給你自己選用的 AI 助理。每個系統都忠於自己的傳統方法論，不會把不同文化的邏輯混在一起。
          </p>
        </div>
      </section>
    </div>
  );
}
