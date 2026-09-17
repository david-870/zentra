import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0B0A",
        }}
      >
        <svg width="108" height="118" viewBox="0 0 51 56" fill="#F3F1EA">
          <path d="M0 0h51v8L11 48h40v8H0v-8l40-40H0V0Z" />
        </svg>
      </div>
    ),
    size,
  );
}
