"use client";

/**
 * No-op replacement for MswProvider in production builds.
 * Turbopack resolves `../mocks/MswProvider` → this file when
 * NEXT_PUBLIC_MOCK_MODE is not "true".
 */
export default function NoopMswProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
