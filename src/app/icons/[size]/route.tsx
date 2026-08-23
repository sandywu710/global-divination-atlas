// 給 manifest.ts 用的 PWA 圖示（192x192 與 512x512），加到手機主畫面時會用到。
import { ImageResponse } from "next/og";
import { buildIconElement } from "@/lib/iconArt";

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: sizeParam } = await params;
  const size = sizeParam === "512" ? 512 : 192; // 只開放這兩種尺寸，其餘一律回傳 192

  return new ImageResponse(buildIconElement(size), { width: size, height: size });
}
