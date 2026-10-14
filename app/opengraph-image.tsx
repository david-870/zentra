import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const source = await readFile(join(process.cwd(), "public/brand/zentra-logo.jpeg"));
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#040916", color: "#f4f6ff", padding: "40px" }}>
      <img alt="Zentra" src={`data:image/jpeg;base64,${source.toString("base64")}`} width={550} height={550} />
      <div style={{ display: "flex", flexDirection: "column", paddingLeft: 28, width: 530 }}>
        <div style={{ fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.04em" }}>Your business, made easier.</div>
        <div style={{ fontSize: 26, lineHeight: 1.4, color: "#bdcce0", marginTop: 28 }}>AI systems, apps, websites, and automation for your business.</div>
        <div style={{ fontSize: 22, color: "#55baff", marginTop: 36 }}>zentratechagency.com</div>
      </div>
    </div>, size,
  );
}
