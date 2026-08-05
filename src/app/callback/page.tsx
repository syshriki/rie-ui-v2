"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useIsLoggedIn } from "../../hooks/auth";

function CallbackClient() {
	const { isLoggedIn, setExpiresAt, setRefreshExpiresAt, setUserId } =
		useIsLoggedIn();
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const expiresAt = searchParams.get("token_expires_at");
		const refreshExpiresAt = searchParams.get("refresh_token_expires_at");
		const userId = searchParams.get("user_id");
		const redirectUri = searchParams.get("redirectUri") ?? "/recipes";
		if (expiresAt && refreshExpiresAt) {
			setExpiresAt(new Date(Number(expiresAt)));
			setRefreshExpiresAt(new Date(Number(refreshExpiresAt)));
			setUserId(userId);
		}
		if (isLoggedIn) {
			router.push(redirectUri);
		}
	}, [setExpiresAt, setRefreshExpiresAt, isLoggedIn, setUserId, router, searchParams]);

	return null;
}

export default function Callback() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CallbackClient />
		</Suspense>
	);
}
