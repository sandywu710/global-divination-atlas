// ────────────────────────────────────────────────────────────
// 問題意圖分類（Question Intent Taxonomy）
// keywords：關鍵字比對用的中英文關鍵字，問題分析器（lib/recommendation.ts）
// 會拿使用者輸入的文字去比對這裡的關鍵字，藉此判斷使用者的問題屬於哪些意圖。
//
// 之後想要讓分析器更準，直接在對應意圖底下「加關鍵字」就好，不用改程式邏輯。
// ────────────────────────────────────────────────────────────
import type { QuestionIntent } from "@/types/divination";

export interface IntentDefinition {
  id: QuestionIntent;
  label: string;
  keywords: string[];
}

export const intentDefinitions: IntentDefinition[] = [
  {
    id: "Career",
    label: "事業",
    keywords: ["工作", "職涯", "升遷", "跳槽", "轉職", "換工作", "離職", "career", "job", "promotion"],
  },
  {
    id: "Job Change",
    label: "換工作／轉職",
    keywords: ["換工作", "轉職", "離職", "跳槽", "換跑道", "resign", "quit my job", "new job"],
  },
  {
    id: "Business",
    label: "創業／事業經營",
    keywords: ["創業", "開店", "公司", "生意", "合夥", "business", "startup", "entrepreneur"],
  },
  {
    id: "Money",
    label: "金錢／財運",
    keywords: ["錢", "財運", "收入", "存款", "負債", "money", "финанс", "wealth", "income"],
  },
  {
    id: "Investment Decision",
    label: "投資決策",
    keywords: ["投資", "股票", "買房", "理財", "投資決定", "invest", "stock", "property"],
  },
  {
    id: "Love",
    label: "感情",
    keywords: ["感情", "喜歡", "曖昧", "戀愛", "愛情", "love", "crush", "in love"],
  },
  {
    id: "Marriage",
    label: "婚姻",
    keywords: ["結婚", "婚姻", "老公", "老婆", "配偶", "marriage", "marry", "wedding"],
  },
  {
    id: "Compatibility",
    label: "合適度／速配",
    keywords: ["適合嗎", "合不合", "速配", "在一起", "compatible", "compatibility", "match"],
  },
  {
    id: "Relationship",
    label: "關係",
    keywords: ["關係", "這個人", "對方", "相處", "relationship", "partner"],
  },
  {
    id: "Breakup",
    label: "分手",
    keywords: ["分手", "復合", "前任", "breakup", "ex", "get back together"],
  },
  {
    id: "Family",
    label: "家庭",
    keywords: ["家人", "家庭", "父母", "小孩", "family", "parents", "children"],
  },
  {
    id: "Life Purpose",
    label: "人生方向",
    keywords: ["人生方向", "人生使命", "我該做什麼", "life purpose", "life direction"],
  },
  {
    id: "Soul Purpose",
    label: "靈魂使命",
    keywords: ["靈魂使命", "天命", "soul purpose", "soul mission"],
  },
  {
    id: "Personal Growth",
    label: "自我成長",
    keywords: ["成長", "自我提升", "突破自己", "personal growth", "self improvement"],
  },
  {
    id: "Future",
    label: "未來",
    keywords: ["未來", "接下來", "以後", "future", "what's next", "ahead"],
  },
  {
    id: "Timing",
    label: "時機",
    keywords: ["什麼時候", "何時", "時機", "timing", "when will", "best time"],
  },
  {
    id: "Decision",
    label: "決策",
    keywords: ["該不該", "要不要", "適不適合", "值得嗎", "decision", "should i", "worth it"],
  },
  {
    id: "Specific Event",
    label: "具體事件",
    keywords: ["這件事", "這個結果", "面試", "考試", "官司", "specific event", "outcome"],
  },
  {
    id: "Past",
    label: "過去",
    keywords: ["過去", "以前", "為什麼會這樣", "past", "why did", "used to"],
  },
  {
    id: "Karma",
    label: "業力／因果",
    keywords: ["業力", "因果", "報應", "karma", "karmic"],
  },
  {
    id: "Past Life",
    label: "前世",
    keywords: ["前世", "上輩子", "past life", "previous life"],
  },
  {
    id: "Spirituality",
    label: "靈性",
    keywords: ["靈性", "修行", "能量", "spirituality", "spiritual", "energy"],
  },
  {
    id: "Dreams",
    label: "夢境",
    keywords: ["做夢", "夢到", "夢境", "dream", "dreamt", "nightmare"],
  },
  {
    id: "Personality",
    label: "個性",
    keywords: ["個性", "性格", "我是什麼樣的人", "personality", "who am i"],
  },
  {
    id: "Self Understanding",
    label: "自我理解",
    keywords: ["了解自己", "認識自己", "迷惘", "self understanding", "confused about myself"],
  },
];

export function getIntentLabel(id: QuestionIntent): string {
  return intentDefinitions.find((i) => i.id === id)?.label ?? id;
}
