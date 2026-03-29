import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShiftPro.ai — AI Workforce Intelligence",
  description: "AI-powered workforce intelligence platform. Scheduling, time tracking, and operational security in one place.",
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
