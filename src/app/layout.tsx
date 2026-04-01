import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShiftPro.ai — Workforce Scheduling & Time Clock",
  description: "The smarter way to schedule shifts, track time, and manage your team. Employee portal, time clock, scheduling — all in one place.",
  openGraph: {
    title: "ShiftPro.ai — Workforce Scheduling & Time Clock",
    description: "Schedule shifts, track time, and manage your team with ShiftPro.",
    url: "https://shiftpro.ai",
    siteName: "ShiftPro.ai",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#05080f" }}>
        {children}
      </body>
    </html>
  );
}
