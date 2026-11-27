import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getPublicContent } from "@/lib/content";

export const alt = "Puneet Shukla, full-stack software developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function OpengraphImage() {
  const c = await getPublicContent();
  const photo = await readFile(path.join(process.cwd(), "assets", "og-portrait.jpg"))
    .then((b) => `data:image/jpeg;base64,${b.toString("base64")}`)
    .catch(() => "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "radial-gradient(circle at 20% 0%, rgba(0,122,204,0.35), transparent 55%), #02091a",
          color: "#ededed",
          padding: 56,
          gap: 48,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#4ec9b0", letterSpacing: 2, textTransform: "uppercase" }}>
            {"const puneet: Developer"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1, letterSpacing: -2 }}>{c.profile.name}</div>
            <div style={{ fontSize: 36, marginTop: 20, color: "rgba(237,237,237,0.7)", lineHeight: 1.25 }}>{c.profile.role}</div>
            <div style={{ fontSize: 28, marginTop: 10, color: "rgba(237,237,237,0.7)" }}>
              {`${c.profile.company} · ${c.profile.location}`}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "rgba(237,237,237,0.5)" }}>Journey · Projects · Films · Contact</div>
        </div>
        {photo ? (
          <div
            style={{
              display: "flex",
              width: 400,
              height: 518,
              borderRadius: 36,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" width={400} height={518} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          </div>
        ) : null}
      </div>
    ),
    size,
  );
}
