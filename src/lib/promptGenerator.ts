// ────────────────────────────────────────────────────────────
// Prompt 產生邏輯：把「系統資料 + 使用者問題 + 使用者 Profile + 品質模式」
// 組合成一份可以直接複製去貼給 ChatGPT / Gemini / Claude 的英文 Prompt。
//
// 文字內容（警語、模式說明等）放在 src/data/promptTemplate.ts，
// 這裡只負責「怎麼組合」的邏輯。
// ────────────────────────────────────────────────────────────
import { modeInstructions, responseStructure, spiritualClaimWarning, universalRules } from "@/data/promptTemplate";
import type { DivinationSystem, PromptMode, UserProfile } from "@/types/divination";

export interface PromptBuildInput {
  system: DivinationSystem;
  question: string;
  profile: UserProfile;
  mode: PromptMode;
}

/** 依照系統需要的資料欄位，組出「使用者資訊」區塊；沒填的欄位標示為 [Not provided] */
function buildUserInfoBlock(profile: UserProfile, system: DivinationSystem): string {
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
    lines.push("Dream description: [User will describe their dream in detail below]");
  if (need.has("randomSelection") || need.has("cards") || need.has("dice"))
    lines.push(
      "Random draw: [User should perform the traditional random draw/casting method themselves, or ask the AI to simulate a random draw and clearly label it as simulated]"
    );

  if (lines.length === 0) return "[No specific personal data required for this system]";
  return lines.join("\n");
}

/** 產生單一系統的完整 Prompt */
export function buildPrompt({ system, question, profile, mode }: PromptBuildInput): string {
  const userInfoBlock = buildUserInfoBlock(profile, system);
  const rules = [...universalRules, spiritualClaimWarning[system.spiritualClaimLevel], system.promptTemplate]
    .filter(Boolean)
    .map((r) => `- ${r}`)
    .join("\n");
  const structure = responseStructure.map((s, i) => `${i + 1}. ${s}`).join("\n");

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

QUESTION:
${question || "[User has not entered a specific question — provide a general reading]"}

Please structure your response as:
${structure}

Stay faithful to the traditional framework of ${system.name} throughout your response.`;
}

/** 多系統比較用的 Prompt（Nice to Have 功能） */
export function buildComparisonPrompt(systems: DivinationSystem[], question: string, profile: UserProfile): string {
  const sections = systems
    .map((system, i) => {
      const body = buildPrompt({ system, question, profile, mode: "Standard" });
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
