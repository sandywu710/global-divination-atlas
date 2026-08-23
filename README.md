# Global Divination Atlas（全球占卜命理地圖）

輸入一個問題，找到最適合的占卜／命理／靈性系統，並產生一份可以直接複製、貼給 ChatGPT／Gemini／Claude
等 AI 助理使用的高品質英文 Prompt。

這個網站**不會**幫你算命，也**不會**呼叫任何 AI API——它是一個「導航工具 ＋ Prompt 產生器」，
所有系統資料與推薦邏輯都是寫死在網站裡的固定資料與規則，你的出生資料只會存在你自己的瀏覽器裡，
不會上傳到任何伺服器。

## 這個網站能做什麼

- 收錄 **50 個**來自全球的占卜、命理與靈性系統（中國八字、紫微斗數、印度占星、西洋占星、塔羅、
  盧恩符文、非洲 Ifá、現代人類圖⋯⋯）
- `/analyzer`：輸入你的問題（例如「我今年適合換工作嗎？」），系統會用關鍵字規則判斷問題類型，
  推薦最適合的系統並說明原因、需要準備什麼資料
- `/explore`：用地區、分類、想探索的主題搜尋與篩選所有系統
- `/system/[id]`：每個系統的完整介紹頁（方法論、限制、相關系統）
- 選好系統後一鍵產生英文 Prompt，附「複製」按鈕，貼去你自己選用的 AI 工具即可
- 支援手機「加入主畫面」，打開像獨立 App 一樣（見下方說明）

## 安裝與本機執行

需要先安裝 [Node.js](https://nodejs.org/)（建議 20 以上版本）。

```bash
cd global-divination-atlas
npm install       # 安裝套件（只需要做一次）
npm run dev       # 啟動開發伺服器
```

啟動後打開瀏覽器到 `http://localhost:3000` 就可以看到網站。

檢查網站有沒有問題、準備要上線前，可以先跑：

```bash
npm run build     # 正式建置（會做完整的檢查）
npm run start     # 用建置好的版本啟動，網址一樣是 http://localhost:3000
```

## 專案結構（給之後想自己改內容的人）

這個專案刻意把「內容資料」跟「畫面邏輯」分開放，大部分想調整文字或規則的需求，
都只需要改 `src/data/` 底下的檔案，不需要碰任何 `.tsx` 元件：

```
src/
├── data/                     ← 內容資料（想改文案、系統介紹、規則，改這裡）
│   ├── systems.ts             50 個占卜系統的完整資料
│   ├── categories.ts          分類／地區的中文顯示名稱
│   ├── intents.ts             問題關鍵字比對表
│   ├── recommendationRules.ts 「問題意圖 → 推薦系統」規則表
│   └── promptTemplate.ts      Prompt 裡用到的固定文字（警語、模式說明等）
├── lib/                       ← 邏輯（問題分析、評分、Prompt 組合、LocalStorage）
├── components/                ← 畫面元件
├── types/divination.ts        ← 所有資料的 TypeScript 型別定義
└── app/                       ← 頁面（首頁、/analyzer、/explore、/system/[id]）
```

常見調整：

- **想改某個系統的介紹文字** → `src/data/systems.ts`，找到對應的 `id`，改 `description` 等欄位
- **想調整「這類問題該推薦哪些系統」** → `src/data/recommendationRules.ts`
- **想讓問題分析器更準** → `src/data/intents.ts`，在對應意圖底下加關鍵字
- **想改 Prompt 的語氣或規則** → `src/data/promptTemplate.ts`
- **想換配色** → `src/app/globals.css` 最上面的顏色變數

## 部署到 Vercel

這個專案是標準的 Next.js 專案，最簡單的方式是用 [Vercel](https://vercel.com/)：

1. 把這個資料夾 push 到 GitHub（見下方「版本控制」）
2. 到 [vercel.com/new](https://vercel.com/new)，選擇這個 GitHub repo，其他都用預設值，按「Deploy」

也可以用 Vercel CLI 從電腦直接部署：

```bash
npx vercel        # 第一次會問幾個問題（用預設值就好），之後會給你一個預覽網址
npx vercel --prod # 正式上線
```

**這個 MVP 不需要設定任何環境變數**（沒有串接資料庫、也沒有串接任何 AI API），部署完成就能直接使用。

## 資料備份與還原

這個網站**沒有帳號系統、沒有後端資料庫**。使用者（包含你自己）填寫的出生日期等個人資料，
全部只存在瀏覽器的 LocalStorage 裡：

- **備份**：目前沒有內建匯出功能（MVP 範圍之外）。如果需要保留資料，建議直接記錄在你自己的
  筆記軟體裡；LocalStorage 的資料只要不清瀏覽器資料、不換瀏覽器／裝置，就會一直保留。
- **清除／還原成乾淨狀態**：打開網站，滑到頁尾，點「清除我的資料」即可清空目前瀏覽器裡儲存的
  所有個人資料、收藏與 Prompt 紀錄。
- **網站內容本身**（50 個系統的資料、推薦規則等）都是寫在程式碼裡的固定資料，不會遺失，
  只要重新部署就會是最新版本；要復原到舊版本，用 Git 的版本紀錄或 Vercel 後台的「Deployments」
  頁面選一個舊版本 Redeploy 即可。

## 怎麼把網站加到手機主畫面（PWA）

網站已經設定好 PWA（Progressive Web App），加入主畫面後打開會像獨立 App 一樣，沒有瀏覽器網址列：

- **iPhone（Safari）**：打開網站 → 點下方或上方的「分享」按鈕（方形加箭頭圖示）→ 選「加入主畫面」
- **Android（Chrome）**：打開網站 → 點右上角「⋮」選單 → 選「新增至主畫面」或「安裝應用程式」

## 技術棧

Next.js（App Router）＋ TypeScript ＋ Tailwind CSS，資料層是純 TypeScript 靜態資料，
個人資料存瀏覽器 LocalStorage，沒有資料庫、沒有後端、沒有串接任何 AI API。
