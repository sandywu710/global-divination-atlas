"use client";

import { useMemo, useState } from "react";
import PromptGenerator from "@/components/PromptGenerator";
import QuestionInput from "@/components/QuestionInput";
import RecommendationCard from "@/components/RecommendationCard";
import { getSystemById } from "@/data/systems";
import { analyzeQuestion, recommendSystems, type SystemRecommendation } from "@/lib/recommendation";
import { loadProfile } from "@/lib/storage";
import type { QuestionAnalysis } from "@/types/divination";

export default function AnalyzerPage() {
  const [question, setQuestion] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<SystemRecommendation[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function handleSubmit(q: string) {
    const result = analyzeQuestion(q);
    const recs = recommendSystems(result, loadProfile());
    setQuestion(q);
    setAnalysis(result);
    setRecommendations(recs);
    setSelectedIds(recs.slice(0, 3).map((r) => r.system.id)); // 預設勾選前三個推薦
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const selectedSystems = useMemo(
    () => selectedIds.map((id) => getSystemById(id)).filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [selectedIds]
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">問問題，找到適合的系統</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal-soft">
          不用先搞懂八字、占星、塔羅、易經的差別。告訴我們你想知道什麼，我們幫你判斷哪些傳統最適合回答這個問題。
        </p>
      </header>

      <QuestionInput initialValue={question ?? ""} onSubmit={handleSubmit} />

      {analysis && (
        <div className="mt-10 space-y-8">
          <div className="rounded-2xl border hairline bg-ivory-soft p-5 text-sm leading-relaxed text-charcoal-soft">
            {analysis.explanation}
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-xl text-charcoal">推薦系統</h2>
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.system.id}
                recommendation={rec}
                selected={selectedIds.includes(rec.system.id)}
                onToggle={toggleSelected}
              />
            ))}
          </div>

          <div>
            <h2 className="mb-4 font-serif text-xl text-charcoal">
              產生 Prompt {selectedSystems.length > 0 && `（已選 ${selectedSystems.length} 個系統）`}
            </h2>
            {selectedSystems.length === 0 ? (
              <p className="rounded-2xl border hairline bg-paper p-5 text-sm text-charcoal-soft">
                先在上面勾選一個或多個系統，才能產生 Prompt。
              </p>
            ) : (
              <PromptGenerator key={question} systems={selectedSystems} initialQuestion={question ?? ""} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
