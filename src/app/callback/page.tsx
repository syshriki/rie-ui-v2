"use client";
import { useIsLoggedIn } from "../../hooks/auth";
import { useEffect } from "react";

export default function Callback() {
	const { isLoggedIn, setExpiresAt } = useIsLoggedIn({});

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const expiresAt = params.get("token_expires_at");
		const redirectUri = params.get("redirectUri") ?? "/recipes";
		if (expiresAt) {
			const date = new Date(Number(expiresAt));
			setExpiresAt(date);
		}
		if (isLoggedIn) {
			window.location.href = redirectUri;
		}
	}, [setExpiresAt, isLoggedIn]);

	return null;
}
