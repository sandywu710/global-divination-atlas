import { ImageResponse } from "next/og";
import { buildIconElement } from "@/lib/iconArt";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(buildIconElement(180), { ...size });
}
