// app/soma/layout.tsx
// Custom layout for SOMA — overrides ShiftPro chrome for full-screen experience
// This strips all navigation and makes the page a standalone dark canvas

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'SOMA — Neurological Wellness',
  description: 'Neurological instruments for the modern mind. Brainwave entrainment, breath synchronization, and frequency programming.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#060610',
};

export default function SomaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400&family=DM+Sans:wght@300;400&family=JetBrains+Mono:wght@300&display=swap" rel="stylesheet" />
      <style>{`
        /* SOMA full-screen override — hide any ShiftPro navigation/chrome */
        body > nav, body > header, body > footer,
        [data-shiftpro-nav], [data-shiftpro-header], [data-shiftpro-sidebar],
        #__next > nav, #__next > header, #__next > footer {
          display: none !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #060610 !important;
          overflow: hidden !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 100dvh !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        body {
          padding-top: env(safe-area-inset-top) !important;
          padding-bottom: env(safe-area-inset-bottom) !important;
          padding-left: env(safe-area-inset-left) !important;
          padding-right: env(safe-area-inset-right) !important;
        }
        ::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
      `}</style>
      {children}
    </>
  );
}
