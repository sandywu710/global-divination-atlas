import type { Metadata, Viewport } from "next";
import { Fraunces, Noto_Sans_TC } from "next/font/google";
import Link from "next/link";
import ClearDataButton from "@/components/ClearDataButton";
import SiteLogo from "@/components/SiteLogo";
import "./globals.css";

// 標題用的襯線字體（編輯誌／博物館質感）
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// 內文用的中文黑體，確保繁體中文在各平台都好讀
const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Global Divination Atlas ｜ 全球占卜命理地圖",
    template: "%s ｜ Global Divination Atlas",
  },
  description:
    "從中國命理、印度占星、塔羅、盧恩符文到非洲占卜與現代靈性系統——輸入一個問題，找到最適合的占卜／命理系統，一鍵產生高品質 Prompt 交給你喜歡的 AI。",
  appleWebApp: {
    capable: true,
    title: "占卜地圖",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ea",
  width: "device-width",
  initialScale: 1,
};

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b hairline bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <SiteLogo />
        <nav className="flex items-center gap-4 text-sm text-charcoal-soft sm:gap-7 sm:text-[15px]">
          <Link href="/analyzer" className="tap-target flex items-center hover:text-charcoal">
            問問題
          </Link>
          <Link href="/explore" className="tap-target flex items-center hover:text-charcoal">
            探索系統
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t hairline px-5 py-10 text-sm text-charcoal-soft sm:px-8">
      <div className="mx-auto max-w-6xl space-y-3">
        <p>
          Global Divination Atlas 是一個「導航工具」，幫助你找到適合的占卜／命理／靈性系統並產生
          Prompt，交給你自己選用的 AI 助理。
        </p>
        <p>
          任何系統的解讀都屬於傳統／象徵性框架，不構成科學驗證的預測，請以參考、反思的心態使用。
        </p>
        <p>
          你的出生資料只會存在你自己的瀏覽器裡，這個網站沒有帳號系統、不會上傳到任何伺服器。
          {" "}
          <ClearDataButton />
        </p>
      </div>
    </footer>
  );
}

// 全站共用的浮水印，低調置中，不搶版面
function SiteWatermark() {
  return (
    <div className="border-t hairline px-5 py-5 sm:px-8">
      <p className="text-center text-xs tracking-wide text-charcoal-soft/60">Made by Sandy</p>
    </div>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${fraunces.variable} ${notoSansTC.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-ivory text-charcoal antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <SiteWatermark />
      </body>
    </html>
  );
}
