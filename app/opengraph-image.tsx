import { ImageResponse } from "next/og";

export const alt = "CauseCI — Explain this GitHub Actions / CI failure";
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
          background: "#0b0c0f",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              background: "#ff6b4a",
              color: "#0b0c0f",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            CI
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 600,
              color: "#eceef2",
            }}
          >
            CauseCI
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#eceef2",
              maxWidth: 960,
            }}
          >
            Explain this GitHub Actions / CI failure.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#8b90a0",
              maxWidth: 860,
              lineHeight: 1.4,
            }}
          >
            Paste a red log. Get a ranked root-cause autopsy — top cause free.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#ff6b4a",
            letterSpacing: 1,
          }}
        >
          causeci.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
