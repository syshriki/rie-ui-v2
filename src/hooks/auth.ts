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
	const [userId, setUserId] = useState<string | null>(null);
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const setExpiresAt = useCallback((date: Date) => {
		window.localStorage.setItem("expiresAt", date.toString());
		setIsLoggedIn(window.localStorage.getItem("expiresAt") !== null);
	}, []);

	// Extract just the path portion without domain
	const currentPath = pathname || "";
	const queryString = searchParams?.toString();
	const redirectPath = queryString
		? `${currentPath}?${queryString}`
		: currentPath;

	const logout = useCallback((redirectUrl: string) => {
		setIsLoading(true);
		return revoke().then(() => {
			window.localStorage.removeItem("expiresAt");
			window.localStorage.removeItem("userId");
			setIsLoggedIn(false);
			setUserId(null);
			window.location.href = redirectUrl;
			setIsLoading(false);
		});
	}, []);

	useEffect(() => {
		const handleStorageChange = () => {
			setIsLoggedIn(window.localStorage.getItem("expiresAt") !== null);
			setUserId(window.localStorage.getItem("userId"));
		};
		handleStorageChange();
		window.addEventListener("storage", handleStorageChange);
		setIsLoading(false);
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

	return { isLoggedIn, logout, isLoading, setExpiresAt, setUserId, userId };
}
