import { MOCK_MODE_USER_ID } from "./fixtures";

/**
 * Seeds localStorage so the app treats the user as logged in.
 * Must run BEFORE any page component reads localStorage (handled by MswProvider).
 */
function seedMockAuth() {
  localStorage.setItem("userId", MOCK_MODE_USER_ID);
  localStorage.setItem(
    "expiresAt",
    new Date(Date.now() + 86400000).toString(),
  );
  localStorage.setItem(
    "refreshExpiresAt",
    new Date(Date.now() + 7 * 86400000).toString(),
  );
}

/**
 * Starts the MSW service worker and seeds mock auth state.
 * All imports are dynamic — `msw` and `handlers` are never loaded
 * in production builds where `NEXT_PUBLIC_MOCK_MODE` is not `"true"`.
 */
export async function enableMocking() {
  const [{ setupWorker }, { handlers }] = await Promise.all([
    import("msw/browser"),
    import("./handlers"),
  ]);

  seedMockAuth();

  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
}
