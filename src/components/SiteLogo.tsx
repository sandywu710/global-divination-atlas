"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 左上角標題／Logo：
// - 不在首頁時，跟一般連結一樣導航回「/」（Next.js 導航到新頁面預設就會捲到頂部）
// - 已經在首頁時，Next.js 不會觸發導航（路徑沒變），所以改成手動捲動回最上方，
//   這樣不管使用者在首頁滑到多下面，點標題都一定會回到最上面。
export default function SiteLogo() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <Link
      href="/"
      onClick={(e) => {
        if (isHome) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      className="font-serif text-base tracking-wide text-charcoal sm:text-lg"
    >
      Global Divination Atlas
    </Link>
  );
}
