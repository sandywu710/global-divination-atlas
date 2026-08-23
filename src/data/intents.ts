// ────────────────────────────────────────────────────────────
// 問題意圖分類（Question Intent Taxonomy）
// keywords：關鍵字比對用的中英文關鍵字，問題分析器（lib/recommendation.ts）
// 會拿使用者輸入的文字去比對這裡的關鍵字，藉此判斷使用者的問題屬於哪些意圖。
//
// 之後想要讓分析器更準，直接在對應意圖底下「加關鍵字」就好，不用改程式邏輯。
// 判斷邏輯（在 lib/recommendation.ts）本身已經是「統計每個分類命中幾個關鍵字，
// 選命中最多的分類」——所以想提高準確度，加關鍵字（尤其是口語、間接的講法）
// 是最直接有效的做法，不需要碰比對邏輯。
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
    keywords: [
      "工作", "職涯", "升遷", "跳槽", "轉職", "換工作", "離職", "上班", "職場", "加薪",
      "職位", "主管", "老闆", "同事", "工作壓力", "工作不順", "職業倦怠", "倦怠", "career",
      "job", "promotion", "workplace", "raise", "boss", "colleague", "burnout", "career path",
    ],
  },
  {
    id: "Job Change",
    label: "換工作／轉職",
    keywords: [
      "換工作", "轉職", "離職", "跳槽", "換跑道", "辭職", "不想做了", "想換環境", "轉行",
      "換個工作", "想離開現在的公司", "resign", "quit my job", "new job", "quit", "switch jobs",
      "change careers",
    ],
  },
  {
    id: "Business",
    label: "創業／事業經營",
    keywords: [
      "創業", "開店", "公司", "生意", "合夥", "自己當老闆", "開公司", "做生意", "事業經營",
      "副業", "business", "startup", "entrepreneur", "side business", "side hustle", "my own business",
    ],
  },
  {
    id: "Money",
    label: "金錢／財運",
    keywords: [
      "錢", "財運", "收入", "存款", "負債", "財務", "經濟壓力", "缺錢", "賺錢", "理財",
      "財富", "薪水", "薪資", "money", "wealth", "income", "finance", "financial", "broke", "salary", "poor",
    ],
  },
  {
    id: "Investment Decision",
    label: "投資決策",
    keywords: [
      "投資", "股票", "買房", "理財", "投資決定", "基金", "加密貨幣", "虛擬貨幣", "買股票",
      "買房子", "投資理財", "invest", "stock", "property", "crypto", "bitcoin", "real estate", "mutual fund",
    ],
  },
  {
    id: "Love",
    label: "感情",
    keywords: [
      "感情", "喜歡", "曖昧", "戀愛", "愛情", "心動", "喜歡上", "愛情運", "桃花", "桃花運",
      "感情運", "感情狀況", "單戀", "暗戀", "love", "crush", "in love", "romance", "romantic", "dating",
    ],
  },
  {
    id: "Marriage",
    label: "婚姻",
    keywords: [
      "結婚", "婚姻", "老公", "老婆", "配偶", "步入婚姻", "婚姻生活", "已婚", "marriage",
      "marry", "wedding", "husband", "wife", "spouse",
    ],
  },
  {
    id: "Compatibility",
    label: "合適度／速配",
    keywords: [
      "適合嗎", "合不合", "速配", "在一起", "適不適合在一起", "速不速配", "契合", "合適的人",
      "是不是對的人", "對的人", "compatible", "compatibility", "match", "soulmate",
    ],
  },
  {
    id: "Relationship",
    label: "關係",
    keywords: [
      "關係", "這個人", "對方", "相處", "伴侶", "另一半", "男友", "女友", "情侶", "對象",
      "交往對象", "曖昧對象", "情感關係", "relationship", "partner", "boyfriend", "girlfriend",
      "significant other",
    ],
  },
  {
    id: "Breakup",
    label: "分手",
    keywords: [
      "分手", "復合", "前任", "分開", "想分手", "該不該分手", "失戀", "breakup", "ex",
      "get back together", "break up", "heartbreak",
    ],
  },
  {
    id: "Family",
    label: "家庭",
    keywords: [
      "家人", "家庭", "父母", "小孩", "爸媽", "兄弟姊妹", "家庭關係", "親子", "家人相處",
      "family", "parents", "children", "sibling", "parenting",
    ],
  },
  {
    id: "Life Purpose",
    label: "人生方向",
    keywords: [
      "人生方向", "人生使命", "我該做什麼", "人生目標", "人生規劃", "不知道要做什麼",
      "找不到方向", "人生道路", "life purpose", "life direction", "life goal", "which direction",
    ],
  },
  {
    id: "Soul Purpose",
    label: "靈魂使命",
    keywords: [
      "靈魂使命", "天命", "靈魂功課", "靈魂目的", "使命是什麼", "soul purpose", "soul mission",
      "soul's purpose", "calling",
    ],
  },
  {
    id: "Personal Growth",
    label: "自我成長",
    keywords: [
      "成長", "自我提升", "突破自己", "想變得更好", "想進步", "自我突破", "成長瓶頸",
      "突破瓶頸", "想改變自己", "personal growth", "self improvement", "become better",
      "breakthrough", "improve myself",
    ],
  },
  {
    id: "Future",
    label: "未來",
    keywords: [
      "未來", "接下來", "以後", "之後", "將來會怎樣", "未來發展", "future", "what's next",
      "ahead", "what will happen", "going forward",
    ],
  },
  {
    id: "Timing",
    label: "時機",
    keywords: [
      "什麼時候", "何時", "時機", "適合的時機", "時機對嗎", "現在是不是時候", "幾時",
      "何時會", "timing", "when will", "best time", "right time", "good time",
    ],
  },
  {
    id: "Decision",
    label: "決策",
    keywords: [
      "該不該", "要不要", "適不適合", "值得嗎", "怎麼選", "選擇", "猶豫", "抉擇", "兩難",
      "不知道該選哪個", "decision", "should i", "worth it", "choose", "choice", "dilemma",
      "torn between",
    ],
  },
  {
    id: "Specific Event",
    label: "具體事件",
    keywords: [
      "這件事", "這個結果", "面試", "考試", "官司", "這次的", "這個機會", "比賽", "申請",
      "結果會如何", "specific event", "outcome", "interview", "exam", "lawsuit", "application", "result",
    ],
  },
  {
    id: "Past",
    label: "過去",
    keywords: [
      "過去", "以前", "為什麼會這樣", "之前", "曾經", "回顧", "past", "why did", "used to",
      "previously", "in the past",
    ],
  },
  {
    id: "Karma",
    label: "業力／因果",
    keywords: [
      "業力", "因果", "報應", "因果關係", "業障", "前因後果", "karma", "karmic",
      "karmic lesson", "cause and effect",
    ],
  },
  {
    id: "Past Life",
    label: "前世",
    keywords: [
      "前世", "上輩子", "前世今生", "累世", "past life", "previous life", "reincarnation", "former life",
    ],
  },
  {
    id: "Spirituality",
    label: "靈性",
    keywords: [
      "靈性", "修行", "能量", "靈修", "冥想", "覺醒", "能量場", "spirituality", "spiritual",
      "energy", "spiritual awakening", "meditation", "higher self",
    ],
  },
  {
    id: "Dreams",
    label: "夢境",
    keywords: [
      "做夢", "夢到", "夢境", "夢見", "常做夢", "重複的夢", "惡夢", "dream", "dreamt",
      "nightmare", "recurring dream",
    ],
  },
  {
    id: "Personality",
    label: "個性",
    keywords: [
      "個性", "性格", "我是什麼樣的人", "個性分析", "天生的個性", "人格特質", "我的特質",
      "personality", "who am i", "character traits",
    ],
  },
  {
    id: "Self Understanding",
    label: "自我理解",
    keywords: [
      "了解自己", "認識自己", "迷惘", "迷茫", "迷失自己", "想不通", "不知道該怎麼辦",
      "不知道怎麼辦", "怎麼辦", "很亂", "心很亂", "心情不好", "心情低落", "低潮", "情緒低落",
      "壓力大", "好累", "很累", "心累", "焦慮", "內心", "內在", "自我懷疑", "不知道自己要什麼",
      "找不到自己", "搞不清楚自己", "self understanding", "confused about myself", "anxious",
      "anxiety", "lost", "confused", "don't know what to do", "overwhelmed", "stressed",
      "emotionally", "inner peace", "who am i really",
    ],
  },
];

export function getIntentLabel(id: QuestionIntent): string {
  return intentDefinitions.find((i) => i.id === id)?.label ?? id;
}
