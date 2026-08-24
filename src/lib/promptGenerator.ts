// ────────────────────────────────────────────────────────────
// Prompt 產生邏輯：把「系統資料 + 使用者問題 + 使用者 Profile + 品質模式」
// 組合成一份可以直接複製去貼給 ChatGPT / Gemini / Claude 的英文 Prompt。
//
// 文字內容（警語、模式說明等）放在 src/data/promptTemplate.ts，
// 這裡只負責「怎麼組合」的邏輯。
// ────────────────────────────────────────────────────────────
import { drawResultRules, modeInstructions, responseLanguageInstruction, responseStructure, spiritualClaimWarning, universalRules } from "@/data/promptTemplate";
import type { DivinationSystem, PromptMode, UserProfile } from "@/types/divination";
import type { ReadingResult } from "@/types/randomDraw";

export interface PromptBuildInput {
  system: DivinationSystem;
  question: string;
  profile: UserProfile;
  mode: PromptMode;
  /** 系統要求 requiresRandomDraw 為 true 時，使用者已經在網站上真正抽出的結果 */
  drawResult?: ReadingResult;
  /** 系統的 requiredInformation 包含 dreamDescription 時（例如夢境占卜），使用者實際輸入的夢境內容 */
  dreamDescription?: string;
}

/** 依照系統需要的資料欄位，組出「使用者資訊」區塊；沒填的欄位標示為 [Not provided] */
function buildUserInfoBlock(profile: UserProfile, system: DivinationSystem, dreamDescription?: string): string {
  const lines: string[] = [];
  const need = new Set([...system.requiredInformation, ...(system.optionalInformation ?? [])]);

  if (need.has("birthDate")) lines.push(`Birth date: ${profile.birthDate || "[Not provided]"}`);
  if (need.has("birthTime")) lines.push(`Birth time: ${profile.birthTime || "[Not provided]"}`);
  if (need.has("birthPlace")) lines.push(`Birth place: ${profile.birthPlace || "[Not provided]"}`);
  if (need.has("currentLocation"))
    lines.push(`Current location: ${profile.currentLocation || "[Not provided]"}`);
  if (need.has("gender")) lines.push(`Gender: ${profile.gender || "[Not provided]"}`);
  if (need.has("relationshipStatus"))
    lines.push(`Relationship status: ${profile.relationshipStatus || "[Not provided]"}`);
  if (need.has("name") || need.has("fullName"))
    lines.push(`Name: ${profile.name || "[Not provided]"}`);

  if (need.has("photo") || need.has("handPhoto"))
    lines.push("Photo: [User will attach a photo separately, if applicable]");
  if (need.has("dreamDescription"))
    lines.push(`Dream description: ${dreamDescription?.trim() ? dreamDescription.trim() : "[Not provided]"}`);
  // requiresRandomDraw 的系統，抽牌結果一律走下面 buildDrawResultsBlock() 那個獨立區塊，
  // 不會、也不應該叫外部 AI「自己模擬抽牌」——這裡刻意跳過舊版的模擬提示文字。
  if (!system.requiresRandomDraw && (need.has("randomSelection") || need.has("cards") || need.has("dice")))
    lines.push(
      "Random draw: [User should perform the traditional random draw/casting method themselves, or ask the AI to simulate a random draw and clearly label it as simulated]"
    );

  if (lines.length === 0) return "[No specific personal data required for this system]";
  return lines.join("\n");
}

/** I Ching（三枚銅板法）專用格式：本卦／之卦／變爻位置，跟卡牌類的格式邏輯相同但形狀不同 */
function buildHexagramResultsBlock(reading: ReadingResult): string {
  const lineDetail = reading.results
    .map((r, i) => `${i + 1}. ${r.itemName}`)
    .join(" / ");
  const changingLines = (reading.changingLineIndices ?? []).map((i) => i + 1);
  const rules = drawResultRules.map((r) => `- ${r}`).join("\n");

  return `METHOD: 3-Coin Method (I Ching)

ACTUAL CAST RESULT (this hexagram was cast by the user through the application's own coin-toss mechanism — it is not hypothetical):
Primary Hexagram: ${reading.hexagramName}
Lines (bottom to top): ${lineDetail}
${changingLines.length > 0 ? `Changing lines: ${changingLines.join(", ")} (counting from the bottom)\nResulting Hexagram: ${reading.resultingHexagramName}` : "No changing lines — read the primary hexagram only."}

IMPORTANT — READ CAREFULLY:
${rules}`;
}

/** 卡牌類（Tarot／Lenormand／Runes...）格式：依抽出順序列出每一項的名稱與正逆位 */
function buildCardResultsBlock(reading: ReadingResult): string {
  const resultLines = reading.results
    .map((r, i) => {
      const position = r.positionLabel ? `${r.positionLabel} — ` : "";
      const orientation = r.reversed === undefined ? "" : r.reversed ? " (Reversed)" : " (Upright)";
      return `${i + 1}. ${position}${r.itemName}${orientation}`;
    })
    .join("\n");
  const rules = drawResultRules.map((r) => `- ${r}`).join("\n");

  return `${reading.deckName ? `DECK: ${reading.deckName}\n` : ""}${reading.spreadName ? `SPREAD: ${reading.spreadName}\n` : ""}
ACTUAL DRAW RESULTS (these items were randomly drawn by the user through the application's own random draw mechanism — they are not hypothetical):
${resultLines}

IMPORTANT — READ CAREFULLY:
${rules}`;
}

/** 六爻專用格式：跟易經的本卦／之卦格式相同（同一套三枚銅板起卦引擎），
 *  但每一爻多列出天干地支（納甲）與六親標註（由 liuyaoEngine.ts 算好），
 *  並且明確指示 AI 依照已經標好的六親、加上起卦日期，自己排六神、判斷用神。
 *  這個函式不會被易經呼叫，buildHexagramResultsBlock() 完全不受影響。 */
function buildLiuYaoResultsBlock(reading: ReadingResult): string {
  const lineDetail = reading.results
    .map((r, i) => `${i + 1}. ${r.itemName} — Stem-Branch: ${r.stemBranch ?? "[missing]"} — Six Relative: ${r.sixRelative ?? "[missing]"}`)
    .join("\n");
  const changingLines = (reading.changingLineIndices ?? []).map((i) => i + 1);
  const rules = drawResultRules.map((r) => `- ${r}`).join("\n");
  const castDate = reading.drawnAt.slice(0, 10);

  return `METHOD: 3-Coin Method (Liu Yao / 六爻), built on the same hexagram-casting mechanism as I Ching

ACTUAL CAST RESULT (this hexagram was cast by the user through the application's own coin-toss mechanism — it is not hypothetical):
Palace (宮): ${reading.palaceName ?? "[missing]"}
Primary Hexagram: ${reading.hexagramName}
Lines (bottom to top, with Stem-Branch and Six Relative already assigned by the application using standard Najia rules):
${lineDetail}
${changingLines.length > 0 ? `Changing lines: ${changingLines.join(", ")} (counting from the bottom)\nResulting Hexagram: ${reading.resultingHexagramName}` : "No changing lines — read the primary hexagram only."}
Cast date: ${castDate}

IMPORTANT — READ CAREFULLY:
${rules}
- The Stem-Branch and Six Relative label for each line above were already calculated by the application using standard Najia (納甲) rules — do NOT recalculate or reassign them.
- Six Spirits (六神): using the cast date above, determine that day's Heavenly Stem via a reliable perpetual calendar, then assign the Six Spirits to the six lines bottom-to-top starting from Qing Long (青龍) if the day stem is Jia/Yi (甲/乙), Zhu Que (朱雀) if Bing/Ding (丙/丁), Gou Chen (勾陳) if Wu (戊), Teng She (螣蛇) if Ji (己), Bai Hu (白虎) if Geng/Xin (庚/辛), or Xuan Wu (玄武) if Ren/Gui (壬/癸) — then continuing upward in the fixed cycle Qing Long → Zhu Que → Gou Chen → Teng She → Bai Hu → Xuan Wu.
- Useful God (用神): based on what the question below is actually about, decide which Six Relative category above is the Useful God for this specific question (e.g. money/spouse-related questions map to Spouse/Wealth 妻財, career/legal/authority matters to Officials/Spirits 官鬼, documents/elders/mother to Parents 父母, children/health/resolution to Offspring 子孫, siblings/peers/competitors to Siblings 兄弟) before making any judgment about the outcome.`;
}

/** 把使用者在網站上實際抽到／起卦的結果，組成 AI 只能解讀、不能重新抽／重新起卦的區塊。
 *  卡牌類、I Ching、六爻的資料形狀不完全相同，所以格式邏輯分開處理，
 *  但規則（IMPORTANT — READ CAREFULLY）共用。六爻雖然跟 I Ching 共用同一套起卦引擎
 *  （method 都是 "coin-toss-hexagram"），但要多印出天干地支／六親，所以用 system.id 分流，
 *  不影響易經本身固定走 buildHexagramResultsBlock()。 */
function buildDrawResultsBlock(reading: ReadingResult, system: DivinationSystem): string {
  if (system.id === "liuyao") return buildLiuYaoResultsBlock(reading);
  return reading.method === "coin-toss-hexagram" ? buildHexagramResultsBlock(reading) : buildCardResultsBlock(reading);
}

/** 產生單一系統的完整 Prompt */
export function buildPrompt({ system, question, profile, mode, drawResult, dreamDescription }: PromptBuildInput): string {
  const userInfoBlock = buildUserInfoBlock(profile, system, dreamDescription);
  const rules = [...universalRules, spiritualClaimWarning[system.spiritualClaimLevel], system.promptTemplate]
    .filter(Boolean)
    .map((r) => `- ${r}`)
    .join("\n");
  const structure = responseStructure.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const drawResultsSection = drawResult ? `\n${buildDrawResultsBlock(drawResult, system)}\n` : "";

  return `You are an experienced practitioner and researcher of ${system.name}${
    system.nativeNames?.length ? ` (${system.nativeNames.join(" / ")})` : ""
  }.

Your task is to provide a tradition-faithful interpretation using the principles of ${system.name}, and to directly address the question below.

METHODOLOGY NOTES FOR THIS SYSTEM:
${system.methodologySummary}

IMPORTANT RULES:
${rules}
- Do not mix ${system.name} with Western astrology, psychology, New Age spirituality, or any other divination system unless the user explicitly asks for a cross-system comparison.

RESPONSE DEPTH: ${modeInstructions[mode]}

USER INFORMATION:
${userInfoBlock}
${drawResultsSection}
QUESTION:
${question || "[User has not entered a specific question — provide a general reading]"}

Please structure your response as:
${structure}

Stay faithful to the traditional framework of ${system.name} throughout your response.

${responseLanguageInstruction}`;
}

/** 多系統比較用的 Prompt（Nice to Have 功能） */
export function buildComparisonPrompt(
  systems: DivinationSystem[],
  question: string,
  profile: UserProfile,
  drawResults?: Record<string, ReadingResult>,
  dreamDescription?: string
): string {
  const sections = systems
    .map((system, i) => {
      const body = buildPrompt({
        system,
        question,
        profile,
        mode: "Standard",
        drawResult: drawResults?.[system.id],
        dreamDescription,
      });
      return `--- SYSTEM ${i + 1}: ${system.name} ---\n${body}`;
    })
    .join("\n\n");

  return `I would like independent readings from ${systems.length} different divination/spiritual traditions on the same question, followed by a cross-system comparison.

First, for EACH system below, provide a complete, independent, tradition-faithful reading. Do NOT let one system's interpretation influence another's — keep them methodologically separate.

${sections}

--- AFTER ALL ${systems.length} INDEPENDENT READINGS ---

Then provide a final comparison section with these headers:
1. Cross-system similarities (themes that multiple systems pointed to independently)
2. Contradictions or tensions between the systems
3. Recurring symbols or motifs worth paying attention to
4. Open questions worth exploring further

Do not force the systems into a single unified conclusion if they genuinely disagree — naming the disagreement is more useful than false consensus.`;
}
