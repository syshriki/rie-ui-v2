"use client";
import { useEffect } from "react";
import { useIsLoggedIn } from "../../hooks/auth";

export default function Callback() {
	const { isLoggedIn, setExpiresAt, setUserId } = useIsLoggedIn({});

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const expiresAt = params.get("token_expires_at");
		const userId = params.get("user_id");
		const redirectUri = params.get("redirectUri") ?? "/recipes";
		if (expiresAt) {
			const date = new Date(Number(expiresAt));
			setExpiresAt(date);
			setUserId(userId);
		}
		if (isLoggedIn) {
			window.location.href = redirectUri;
		}
	}, [setExpiresAt, isLoggedIn, setUserId]);

	return null;
}
