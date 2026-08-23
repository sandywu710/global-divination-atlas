import type { MetadataRoute } from "next";

// PWA 設定：讓 Sandy 用手機瀏覽器「加入主畫面」後，打開時像獨立 App 一樣
// （沒有網址列），並套用第 13 節的暖色調視覺。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Global Divination Atlas",
    short_name: "占卜地圖",
    description: "輸入一個問題，找到最適合的占卜／命理／靈性系統，一鍵產生 Prompt 交給你喜歡的 AI。",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ea",
    theme_color: "#f7f3ea",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
