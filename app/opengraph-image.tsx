import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0B0A",
          color: "#F3F1EA",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="42" height="46" viewBox="0 0 51 56">
            <path fill="#F3F1EA" d="M0 0h51v8L11 48h40v8H0v-8l40-40H0V0Z" />
          </svg>
          <div style={{ display: "flex", fontSize: 42, letterSpacing: "-0.06em", marginLeft: 4 }}>entra</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, letterSpacing: "-0.05em", lineHeight: 1.05 }}>
            Build. Automate. Grow.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 28,
              color: "#A39E92",
              lineHeight: 1.35,
              maxWidth: 820,
            }}
          >
            {site.description}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
