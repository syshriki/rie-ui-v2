"use client";
import { revoke } from "../../api/client";
import { useIsLoggedIn } from "../../hooks/auth";
import { useEffect } from "react";

export default function LogoutLayout() {
	const { logout, isLoading, isLoggedIn } = useIsLoggedIn({});

	useEffect(() => {
		if (!isLoading && isLoggedIn) {
			logout("/login");
		}
	}, [logout, isLoading, isLoggedIn]);

	return null;
}
