"use client";
import { useCallback, useEffect, useState } from "react";
import { revoke, tryRefreshToken } from "../api/client";

export function useIsLoggedIn({requiresLogin = false}: {requiresLogin?: boolean}): { userId: string | null, isLoggedIn: boolean; logout: (redirectUrl: string) => void; isLoading: boolean; setExpiresAt: (date: Date) => void } {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const setExpiresAt = useCallback((date: Date) => {
        window.localStorage.setItem('expiresAt', date.toString());
        setIsLoggedIn(window.localStorage.getItem('expiresAt') !== null);
    }, []);

    const logout = useCallback((redirectUrl: string) => {
        setIsLoading(true);
        return revoke().then(() => {
            window.localStorage.removeItem('expiresAt');
            window.localStorage.removeItem('userId');
            setIsLoggedIn(false);
            window.location.href = redirectUrl;
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            setIsLoggedIn(window.localStorage.getItem('expiresAt') !== null);
            setUserId(window.localStorage.getItem('userId'));
        }
        handleStorageChange();
        window.addEventListener('storage', handleStorageChange);
        setIsLoading(false);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);


	useEffect(() => {
		if (!isLoggedIn && !isLoading && requiresLogin) {
            setIsLoading(true);
            tryRefreshToken("/add").then((response) => {
                setIsLoggedIn(true);
                setIsLoading(false);
            });
		}
	}, [isLoggedIn, isLoading, requiresLogin]);

    return { isLoggedIn, logout, isLoading, setExpiresAt, userId };
}
