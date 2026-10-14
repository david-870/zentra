import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const source = await readFile(join(process.cwd(), "public/brand/zentra-logo.jpeg"));
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden", position: "relative", background: "#040a16" }}>
      <div style={{ position: "absolute", left: "9%", top: "22%", width: "82%", height: "56%", display: "flex", overflow: "hidden" }}>
      <img alt="" src={`data:image/jpeg;base64,${source.toString("base64")}`} width={size.width * 2.684} height={size.height * 2.684} style={{ position: "absolute", left: -size.width * 0.932, top: -size.height * 0.696 }} />
      </div>
    </div>, size,
  );
}
