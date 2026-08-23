import { describe, expect, it } from "vitest";
import { analyzeQuestion } from "../recommendation";
import { getIntentLabel } from "@/data/intents";

// 這份測試主要是防止「關鍵字覆蓋率」再次退化回去——
// 特別針對之前回報過的兩個誤判／掉進 fallback 的案例，加上一批涵蓋各類型問題的句子，
// 確保 fallback（完全比對不到關鍵字）跟明顯誤判的狀況不會再發生。
describe("analyzeQuestion：關鍵字覆蓋率回歸測試", () => {
  it("「我想知道我適不適合現在的伴侶」不應該被誤判成決策類，應該落在感情／關係相關分類", () => {
    const result = analyzeQuestion("我想知道我適不適合現在的伴侶");
    expect(result.primaryIntent).not.toBe("Decision");
    expect(["Relationship", "Love", "Compatibility", "Marriage"]).toContain(result.primaryIntent);
  });

  it("「我最近很焦慮，不知道該怎麼辦」不應該掉進完全沒有關鍵字命中的 fallback", () => {
    const result = analyzeQuestion("我最近很焦慮，不知道該怎麼辦");
    // fallback 的判斷依據是 explanation 文字（見 recommendation.ts），
    // 命中關鍵字時 explanation 一定會提到「偵測到主要跟」
    expect(result.explanation).toContain("偵測到主要跟");
    expect(result.primaryIntent).toBe("Self Understanding");
  });

  // 涵蓋情緒性、感情類、決策類、自我探索類，每類至少 2-3 句不同講法
  const shouldNotFallback: { question: string; expectAnyOf?: string[] }[] = [
    { question: "我最近心情很低落，不知道自己要什麼", expectAnyOf: ["Self Understanding"] },
    { question: "最近壓力好大，整個人很累，想不通為什麼會這樣", expectAnyOf: ["Self Understanding"] },
    { question: "我常常覺得很迷茫，搞不清楚自己想要什麼", expectAnyOf: ["Self Understanding", "Life Purpose"] },
    { question: "我和男友最近常常吵架，不知道還適不適合在一起", expectAnyOf: ["Relationship", "Compatibility", "Love"] },
    { question: "我跟另一半的關係好像出了問題", expectAnyOf: ["Relationship"] },
    { question: "我該不該跟現在交往的對象繼續走下去", expectAnyOf: ["Relationship", "Decision", "Compatibility"] },
    { question: "我該辭職嗎，最近工作壓力大到快撐不住了", expectAnyOf: ["Job Change", "Career"] },
    { question: "要不要換一份新工作比較好", expectAnyOf: ["Job Change", "Career"] },
    { question: "這個投資機會值得我現在進場嗎", expectAnyOf: ["Investment Decision", "Decision"] },
    { question: "我很猶豫，不知道該怎麼選才好", expectAnyOf: ["Decision"] },
  ];

  it.each(shouldNotFallback)("「$question」不應該掉進 fallback", ({ question, expectAnyOf }) => {
    const result = analyzeQuestion(question);
    expect(result.explanation).toContain("偵測到主要跟");
    if (expectAnyOf) {
      expect(expectAnyOf).toContain(result.primaryIntent);
    }
  });

  it("完全無關的亂數文字，還是要有合理的 fallback，不能整頁空白或出錯", () => {
    const result = analyzeQuestion("asdkjaslkdjalksjd 12345");
    expect(result.primaryIntent).toBeDefined();
    expect(result.recommendedSystemIds.length).toBeGreaterThan(0);
    expect(result.explanation.length).toBeGreaterThan(0);
  });
});

// 順便留一個小工具測試：確認 getIntentLabel 對這次擴充的分類還是找得到中文標籤
describe("getIntentLabel", () => {
  it("Self Understanding 對應到「自我理解」", () => {
    expect(getIntentLabel("Self Understanding")).toBe("自我理解");
  });
});
