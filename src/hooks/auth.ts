"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { revoke } from "../api/auth";

function isUserLoggedIn(): boolean {
	if (typeof window === "undefined") return false;
	// The refresh token lifetime determines whether the user is still
	// "logged in" — as long as it's valid they can get a new access token.
	const str = window.localStorage.getItem("refreshExpiresAt");
	if (str) {
		return new Date(str) > new Date();
	}
	return false;
}

export function useIsLoggedIn(): {
	userId: string | null;
	isLoggedIn: boolean;
	logout: (redirectUrl: string) => void;
	isLoading: boolean;
	setExpiresAt: (date: Date) => void;
	setRefreshExpiresAt: (date: Date) => void;
	setUserId: (id: string | null) => void;
} {
	// Always initialize to "not logged in" so server and client
	// render identical HTML during hydration (avoids React error #418).
	// Sync with localStorage in the useEffect below.
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [userId, setUserIdState] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

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

	}, []);

	const setRefreshExpiresAt = useCallback((date: Date) => {
		window.localStorage.setItem("refreshExpiresAt", date.toString());

		setIsLoggedIn(true);
	}, []);

	const logout = useCallback(
		(redirectUrl: string) => {
			return revoke().then(() => {
				if (typeof window !== "undefined") {
					window.localStorage.removeItem("expiresAt");
					window.localStorage.removeItem("refreshExpiresAt");
					window.localStorage.removeItem("userId");
				}
				setIsLoggedIn(false);
				setUserId(null);
				router.push(redirectUrl);
			});
		},
		[setUserId, router],
	);

	// Sync auth state from localStorage after hydration.
	// This must happen in useEffect so server and client render
	// identical HTML (avoids React hydration error #418).
	useEffect(() => {
		setIsLoggedIn(isUserLoggedIn());
		const storedUserId = window.localStorage.getItem("userId");
		setUserIdState(storedUserId);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === "refreshExpiresAt") {
				setIsLoggedIn(isUserLoggedIn());
			}
			if (event.key === "userId") {
				setUserIdState(event.newValue);
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, []);

	return {
		isLoggedIn,
		logout,
		isLoading,
		setExpiresAt,
		setRefreshExpiresAt,
		setUserId,
		userId,
	};
}
