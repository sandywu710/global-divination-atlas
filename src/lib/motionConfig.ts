// ────────────────────────────────────────────────────────────
// 首頁 Hero 動態效果的集中設定檔。
//
// 想調整任何動態的「快慢、幅度、時間」，都改這裡的數字就好，
// 不用到 HeroSection / HeroBackdrop 裡到處找寫死的數值。
//
// 這份設定會被 CSS（globals.css 用 CSS 變數讀取一部分）跟 JS（元件直接 import）
// 兩邊共用，所以數值單位在註解裡都寫清楚（px／ms／sec）。
// ────────────────────────────────────────────────────────────

export const motionConfig = {
  /** 頁面第一次載入時，Hero 各圖層依序淡入浮現的進場動畫 */
  entrance: {
    /** 整個進場動畫（從背景出現到 CTA 按鈕完全淡入）控制在這個時間內完成，單位 ms */
    totalDurationMs: 1400,
    /** 單一元素本身淡入的時間，單位 ms */
    itemDurationMs: 700,
    /** 每個元素之間依序出現的間隔，單位 ms（背景 → 標籤 → 標題 → 副標 → CTA） */
    staggerMs: 130,
    /** 進場時往上浮現的位移距離，單位 px（很小，是「浮現」不是「飛入」） */
    riseDistancePx: 14,
    /** 淡入時的 easing，平滑的 ease-out，讓動作後段自然變慢 */
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  },

  /** Hero 背景的星點／經緯線紋理層（呼應網站自己 favicon 的「星圖」品牌意象） */
  backdrop: {
    /** 整層背景紋理轉一圈需要的時間，單位 sec——刻意設在分鐘等級，幾乎察覺不到在動 */
    rotationDurationSec: 240,
    /** 星點呼吸閃爍一次完整週期的時間，單位 sec */
    twinkleDurationSec: 7,
    /** 星點閃爍時的透明度範圍 */
    twinkleMinOpacity: 0.35,
    twinkleMaxOpacity: 0.7,
    /** 整個背景紋理層的基礎透明度上限（乘在 twinkle 的結果上），確保視覺上足夠安靜 */
    baseOpacity: 0.5,
  },

  /** 滑鼠視差（Phase 3 才會實際接上），先把數值定義好 */
  parallax: {
    /** 背景紋理層可以位移的最大距離，單位 px */
    backdropMaxOffsetPx: 10,
    /** 文字內容層可以位移的最大距離，單位 px（比背景小，營造景深） */
    contentMaxOffsetPx: 4,
    /** 位移跟隨滑鼠移動時的平滑係數（0-1，越小越平滑／越慢跟上） */
    smoothing: 0.08,
  },

  /** 往下捲動離開 Hero 時，動態強度如何減弱（Phase 3 才會實際接上） */
  scrollFade: {
    /** 捲動超過這個高度（單位 px）之後，動態強度視為完全 0 */
    fullyFadedAtPx: 480,
  },
} as const;
