"use client";

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE PREVIEW ROUTE
// ═══════════════════════════════════════════════════════════════
// Renders the marketing landing page regardless of auth state.
// Visit: http://localhost:3000/preview   (or /preview on any deploy)
//
// DELETE THIS FOLDER (src/app/preview/) before going to production
// if you don't want the landing reachable from a logged-in session.
// ═══════════════════════════════════════════════════════════════

import { LandingPage } from "../page";

export default function Preview() {
  return <LandingPage />;
}

