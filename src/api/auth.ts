import type {
	RefreshTokenResponse,
} from "./models";

export class AuthenticationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AuthenticationError";
	}
}

export async function refresh(): Promise<RefreshTokenResponse> {
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

	if (!response.ok) {
		throw new Error(`refresh failed with status ${response.status}`);
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
}
