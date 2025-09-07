"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
		typeof window !== "undefined"
			? window.localStorage.getItem("expiresAt") !== null
			: false,
	);
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
				setIsLoggedIn(event.newValue !== null);
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
