"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { revoke, tryRefreshToken } from "../api/client";

export function useIsLoggedIn({
	requiresLogin = false,
}: { requiresLogin?: boolean }): {
	userId: string | null;
	isLoggedIn: boolean;
	logout: (redirectUrl: string) => void;
	isLoading: boolean;
	setExpiresAt: (date: Date) => void;
	setUserId: (id: string | null) => void;
} {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(true);
	const [userId, setUserIdState] = useState<string | null>(null);
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Modified to update both localStorage and state
	const setUserId = useCallback((id: string | null) => {
		if (id) {
			window.localStorage.setItem("userId", id);
		} else {
			window.localStorage.removeItem("userId");
		}
		setUserIdState(id);
	}, []);

	const setExpiresAt = useCallback((date: Date) => {
		window.localStorage.setItem("expiresAt", date.toString());
		setIsLoggedIn(true);
	}, []);

	// Extract just the path portion without domain
	const currentPath = pathname || "";
	const queryString = searchParams?.toString();
	const redirectPath = queryString
		? `${currentPath}?${queryString}`
		: currentPath;

	const logout = useCallback(
		(redirectUrl: string) => {
			setIsLoading(true);
			return revoke().then(() => {
				window.localStorage.removeItem("expiresAt");
				window.localStorage.removeItem("userId");
				setIsLoggedIn(false);
				setUserId(null);
				window.location.href = redirectUrl;
				setIsLoading(false);
			});
		},
		[setUserId],
	);

	useEffect(() => {
		const handleStorageChange = (event: StorageEvent) => {
			// Only update for relevant keys
			if (event.key === "expiresAt") {
				setIsLoggedIn(event.newValue !== null);
			}
			if (event.key === "userId") {
				setUserIdState(event.newValue);
			}
		};

		// Initialize from localStorage on mount
		setIsLoggedIn(window.localStorage.getItem("expiresAt") !== null);
		const storedUserId = window.localStorage.getItem("userId");
		if (storedUserId) {
			setUserIdState(storedUserId);
		}
		setIsLoading(false);

		window.addEventListener("storage", handleStorageChange);
		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, []);

	useEffect(() => {
		if (!isLoggedIn && !isLoading && requiresLogin) {
			setIsLoading(true);
			tryRefreshToken(redirectPath)
				.then((response) => {
					setIsLoggedIn(true);
					setIsLoading(false);
				})
				.catch(() => {}); // noop, already redirected
		}
	}, [isLoggedIn, isLoading, requiresLogin, redirectPath]);

	console.log({ isLoggedIn, userId });
	return { isLoggedIn, logout, isLoading, setExpiresAt, setUserId, userId };
}
