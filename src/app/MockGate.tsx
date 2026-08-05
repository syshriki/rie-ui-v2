"use client";

import { useEffect, useState } from "react";

/**
 * Inlined at build time. When `"false"` or undefined the dynamic import
 * below is dead-code-eliminated — zero `mocks/` code reaches production.
 */
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

export default function MockGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [Provider, setProvider] =
    useState<React.ComponentType<{ children: React.ReactNode }> | null>(null);

  useEffect(() => {
    if (!MOCK_MODE) return;
    let cancelled = false;
    import("../mocks/MswProvider")
      .then((m) => {
        if (!cancelled) setProvider(() => m.default);
      })
      .catch(() => {
        if (!cancelled) setProvider(() => null); // resolve so UI unblocks
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!MOCK_MODE) return children;
  if (!Provider) return null;
  return <Provider>{children}</Provider>;
}
