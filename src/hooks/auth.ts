"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthenticationError, revoke, tryRefreshToken } from "../api/client";

function isUserLoggedIn(): boolean {
	if (typeof window === "undefined") return false;
	const expiresAtStr = window.localStorage.getItem("expiresAt");
	if (expiresAtStr) {
		const expiresAt = new Date(expiresAtStr);
		return expiresAt > new Date();
	}
	return false;
}

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
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isUserLoggedIn());
	const [isLoading, setIsLoading] = useState(true);
	const [userId, setUserIdState] = useState<string | null>(
		typeof window !== "undefined"
			? window.localStorage.getItem("userId")
			: null,
	);
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();

	const setUserId = useCallback((id: string | null) => {
		if (typeof window !== "undefined") {
			if (id) {
				window.localStorage.setItem("userId", id);
			} else {
				window.localStorage.removeItem("userId");
			}
		}
		setUserIdState(id);
	}, []);

	const setExpiresAt = useCallback((date: Date) => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem("expiresAt", date.toString());
		}
		setIsLoggedIn(true);
	}, []);

	const currentPath = pathname || "";
	const queryString = searchParams?.toString();
	const redirectPath = queryString
		? `${currentPath}?${queryString}`
		: currentPath;

	const logout = useCallback(
		(redirectUrl: string) => {
			setIsLoading(true);
			return revoke().then(() => {
				if (typeof window !== "undefined") {
					window.localStorage.removeItem("expiresAt");
					window.localStorage.removeItem("userId");
				}
				setIsLoggedIn(false);
				setUserId(null);
				router.push(redirectUrl);
				setIsLoading(false);
			});
		},
		[setUserId, router],
	);

	useEffect(() => {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === "expiresAt") {
				setIsLoggedIn(isUserLoggedIn());
			}
			if (event.key === "userId") {
				setUserIdState(event.newValue);
			}
		};

		setIsLoading(false);

		if (typeof window !== "undefined") {
			window.addEventListener("storage", handleStorageChange);
			return () => {
				window.removeEventListener("storage", handleStorageChange);
			};
		}
	}, []);

	useEffect(() => {
		const isTokenExpired = () => {
			const expiresAtStr = window.localStorage.getItem("expiresAt");
			if (expiresAtStr) {
				const expiresAt = new Date(expiresAtStr);
				return expiresAt <= new Date();
			}
			return false;
		};

		// Don't attempt token refresh if already on login/callback pages
		const isAuthPage = pathname === '/login' || pathname === '/callback' || pathname === '/logout';
		
		if (!isLoading && ((!isLoggedIn && requiresLogin) || isTokenExpired()) && !isAuthPage) {
			setIsLoading(true);
			tryRefreshToken(redirectPath)
				.then((response) => {
					setIsLoggedIn(true);
					setIsLoading(false);
				})
				.catch((error) => {
					if (error instanceof AuthenticationError) {
						// already redirected to login
					} else {
						// other errors, redirect to error page
						window.location.href = "/error";
					}
				});
		}
	}, [isLoggedIn, isLoading, requiresLogin, redirectPath, pathname]);

	return { isLoggedIn, logout, isLoading, setExpiresAt, setUserId, userId };
}
