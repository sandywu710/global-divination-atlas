import { ImageResponse } from "next/og";
import { buildIconElement } from "@/lib/iconArt";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(buildIconElement(32), { ...size });
}
