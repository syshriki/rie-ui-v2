"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useIsLoggedIn } from "../../hooks/auth";

// Client component that uses useSearchParams hook
function CallbackClient() {
	const { isLoggedIn, setExpiresAt, setUserId } = useIsLoggedIn({});
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const expiresAt = searchParams.get("token_expires_at");
		const userId = searchParams.get("user_id");
		const redirectUri = searchParams.get("redirectUri") ?? "/recipes";
		if (expiresAt) {
			const date = new Date(Number(expiresAt));
			setExpiresAt(date);
			setUserId(userId);
		}
		if (isLoggedIn) {
			router.push(redirectUri);
		}
	}, [setExpiresAt, isLoggedIn, setUserId, router, searchParams]);

	return null;
}

// Main page component with Suspense boundary
export default function Callback() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CallbackClient />
		</Suspense>
	);
}
