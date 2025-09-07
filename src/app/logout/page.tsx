"use client";
import { Suspense, useEffect } from "react";
import { useIsLoggedIn } from "../../hooks/auth";

// Client component that uses useSearchParams indirectly through useIsLoggedIn
function LogoutClient() {
	const { logout, isLoading, isLoggedIn } = useIsLoggedIn({});

	useEffect(() => {
		if (!isLoading && isLoggedIn) {
			logout("/login");
		}
	}, [logout, isLoading, isLoggedIn]);

	return null;
}

// Main page component with Suspense boundary
export default function LogoutLayout() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LogoutClient />
		</Suspense>
	);
}
