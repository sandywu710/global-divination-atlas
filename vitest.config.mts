import { defineConfig } from "vitest/config";

// 讓測試檔案跟正式程式碼一樣可以用 "@/..." 這個路徑別名（對應 tsconfig.json 的 paths 設定）
export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
