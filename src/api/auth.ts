import type {
	IntrospectResponse,
	RefreshTokenResponse,
} from "./models";

export class AuthenticationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AuthenticationError";
	}
}

export async function tryRefreshToken(redirectUri = "/recipes") {
	// Don't redirect if already on login page to prevent loops
	if (typeof window !== 'undefined' && window.location.pathname === '/login') {
		throw new AuthenticationError('Already on login page');
	}

	let expiresAt = window.localStorage.getItem("expiresAt");
	const userId = window.localStorage.getItem("userId");
	const isInvalidExpiresAt =
		expiresAt && Number.isNaN(new Date(expiresAt).getTime());
	try {
		if (!expiresAt || isInvalidExpiresAt || !userId) {
			const { exp, sub } = await introspect();
			expiresAt = new Date(exp * 1000).toString();
			window.localStorage.setItem("expiresAt", expiresAt);
			window.localStorage.setItem("userId", sub);
		}

		const expiresAtDate = new Date(expiresAt);

		const now = new Date();

		const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

		//User has logged in but token/refresh token could be expired
		if (expiresAtDate < fiveMinutesFromNow) {
			const refreshResponse = await refresh();
			window.localStorage.setItem(
				"expiresAt",
				new Date(refreshResponse.expiresAt).toString(),
			);
		}
		return; // token is valid
	} catch (error) {
		console.log(error);
		if (error instanceof AuthenticationError) {
			window.location.href = `/login?redirectUri=${redirectUri}`;
		}
		throw error;
	}
}

async function introspect(): Promise<IntrospectResponse> {
	const response = await fetch("/auth/applications/1/oauth/introspect", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		credentials: "include",
	});

	if ([400, 401].includes(response.status)) {
		throw new AuthenticationError(await response.text());
	}

	await failOnNonOk(response);
	return await response.json();
}

async function refresh(): Promise<RefreshTokenResponse> {
	const response = await fetch(
		"/auth/applications/1/oauth/token?response_mode=cookie",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);

	if ([401, 400].includes(response.status)) {
		throw new AuthenticationError(await response.text());
	}

	return await response.json();
}

export async function revoke(): Promise<void> {
	await fetch("/auth/applications/1/oauth/revoke", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	return;
}

async function failOnNonOk(response: Response) {
	if (response.status === 404 || response.status >= 500) {
		window.location.href = "/error";
		throw new Error(`request failed with status ${response.status}`);
	}
}
