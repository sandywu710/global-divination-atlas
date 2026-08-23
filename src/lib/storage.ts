// ────────────────────────────────────────────────────────────
// LocalStorage 存取工具
// 使用者的個人資料（出生日期等）全部存在瀏覽器本機，不會上傳到任何伺服器。
// 這個網站沒有帳號系統、沒有後端資料庫。
// ────────────────────────────────────────────────────────────
import type { UserProfile } from "@/types/divination";

const PROFILE_KEY = "gda:profile";
const FAVORITES_KEY = "gda:favorites";
const PROMPT_HISTORY_KEY = "gda:prompt-history";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ── 個人 Profile ────────────────────────────────────────────

export function loadProfile(): UserProfile {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : {};
  } catch {
    return {};
  }
}

export function saveProfile(profile: UserProfile): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // LocalStorage 不可用（例如無痕模式關閉儲存）時，安靜地略過即可，不影響其他功能。
  }
}

export function clearProfile(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    // 忽略
  }
}

// ── 收藏系統（Nice to have） ──────────────────────────────────

export function loadFavorites(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(systemId: string): string[] {
  const current = loadFavorites();
  const next = current.includes(systemId) ? current.filter((id) => id !== systemId) : [...current, systemId];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      // 忽略
    }
  }
  return next;
}

// ── Prompt 歷史紀錄（Nice to have，只留最近 20 筆） ─────────────

export interface PromptHistoryEntry {
  id: string;
  createdAt: string;
  systemIds: string[];
  question: string;
  prompt: string;
}

export function loadPromptHistory(): PromptHistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(PROMPT_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as PromptHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addPromptHistory(entry: Omit<PromptHistoryEntry, "id" | "createdAt">): void {
  if (!isBrowser()) return;
  try {
    const current = loadPromptHistory();
    const next: PromptHistoryEntry[] = [
      { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
      ...current,
    ].slice(0, 20);
    window.localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // 忽略
  }
}

export function clearAllData(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(PROFILE_KEY);
    window.localStorage.removeItem(FAVORITES_KEY);
    window.localStorage.removeItem(PROMPT_HISTORY_KEY);
  } catch {
    // 忽略
  }
}
