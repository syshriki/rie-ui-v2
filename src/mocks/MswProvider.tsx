"use client";

import { useEffect, useState } from "react";

/**
 * At build time, Next.js inlines `process.env.NEXT_PUBLIC_MOCK_MODE` to
 * the literal value from the environment. When it's not `"true"` the
 * entire MSW code path is dead-code-eliminated — `msw` and the handlers
 * are never loaded in production builds.
 */
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

export default function MswProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // In non-mock mode, ready starts true so we render children immediately.
  const [ready, setReady] = useState(!MOCK_MODE);

  useEffect(() => {
    if (!MOCK_MODE) return;
    let cancelled = false;
    // Dynamic import ensures msw + handlers are code-split into a
    // separate chunk that is only fetched when mock mode is active.
    import("./browser")
      .then((m) => m.enableMocking())
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        // Service worker registration failed (e.g. private browsing).
        // Render the app anyway — API calls will fail but the UI won't hang.
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>Loading mock data…</div>;
  }

  return <>{children}</>;
}
