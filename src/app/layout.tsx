import "./globals.css";
export const metadata = { title: "ShiftPro.ai", description: "AI Workforce Intelligence" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body style={{margin:0,background:"#05080f"}}>{children}</body></html>);
}
