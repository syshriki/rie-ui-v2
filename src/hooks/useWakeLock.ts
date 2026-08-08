"use client";
import { useEffect, useRef } from "react";

/**
 * Requests a screen wake lock on mount and releases it on unmount.
 *
 * Pass a custom `navigator` in tests to avoid reaching for the global —
 * the hook only touches `window.navigator` when no override is given.
 */
export function useWakeLock(navigatorOverride?: Navigator) {
	const sentinelRef = useRef<WakeLockSentinel | null>(null);

	useEffect(() => {
		const nav =
			navigatorOverride ??
			(typeof window !== "undefined" ? window.navigator : undefined);

		if (!nav || !("wakeLock" in nav)) return;

		let cancelled = false;

		nav.wakeLock
			.request("screen")
			.then((sentinel) => {
				if (cancelled) {
					sentinel.release();
					return;
				}
				sentinelRef.current = sentinel;
			})
			.catch((err) => {
				console.warn("Wake lock request failed:", err);
			});

		return () => {
			cancelled = true;
			if (sentinelRef.current) {
				sentinelRef.current.release();
				sentinelRef.current = null;
			}
		};
	}, [navigatorOverride]);

	return sentinelRef;
}
