import type { CreateRecipeRequest } from "../models/Recipe";
import type {
	IntrospectResponse,
	Recipe,
	RefreshTokenResponse,
} from "./models";

export async function tryRefreshToken(redirectUri = "/browse") {
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
		window.location.href = `/login?redirectUri=${redirectUri}`;
		throw new Error("not authenticated, redirecting to login");
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
		throw new Error(await response.text());
	}

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
		throw new Error(await response.text());
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
	if (!response.ok) {
		throw new Error(
			JSON.stringify({
				status: response.status,
				body: await response.json(),
			}),
		);
	}
}

export async function postRecipe(recipe: CreateRecipeRequest): Promise<Recipe> {
	await tryRefreshToken();

	const response = await fetch("/api/recipes", {
		method: "POST",
		body: JSON.stringify(recipe),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	await failOnNonOk(response);

	return await response.json();
}

export async function deleteRecipe(slug: string): Promise<void> {
	await tryRefreshToken();

	const response = await fetch(`/api/recipes/${slug}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	await failOnNonOk(response);

	return;
}

type RecipeQueryParams = {
	pageSize?: number;
	query: string;
} & (
	| { page: number; cursor?: never }
	| { page?: never; cursor: string | null }
);

export async function getRecipes(queryParams: RecipeQueryParams) {
	await tryRefreshToken();

	const { pageSize = 10, query, page, cursor } = queryParams;
	const params = new URLSearchParams();

	if (page !== undefined) {
		params.append("page", page.toString());
	} else if (cursor !== undefined) {
		params.append("cursor", cursor !== null ? cursor : "");
	}

	params.append("pageSize", pageSize.toString());
	params.append("q", query);

	const response = await fetch(`/api/recipes?${params.toString()}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	await failOnNonOk(response);

	return await response.json();
}

export async function getRecipe(slug: string) {
	await tryRefreshToken();

	const response = await fetch(`/api/recipes/${slug}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	await failOnNonOk(response);

	return await response.json();
}

export async function getRecipesAnonymous(queryParams: RecipeQueryParams) {
	const { pageSize = 10, query, page, cursor } = queryParams;
	const params = new URLSearchParams();

	if (page !== undefined) {
		params.append("page", page.toString());
	} else if (cursor !== undefined) {
		params.append("cursor", cursor !== null ? cursor : "");
	}

	params.append("pageSize", pageSize.toString());
	params.append("q", query);

	const response = await fetch(`/api/anonymous/recipes?${params.toString()}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	await failOnNonOk(response);

	return await response.json();
}

export async function getRecipeAnonymous(slug: string) {
	const response = await fetch(`/api/anonymous/recipes/${slug}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	await failOnNonOk(response);

	return await response.json();
}

export async function updateRecipe(
	slug: string,
	recipe: CreateRecipeRequest,
): Promise<Recipe> {
	await tryRefreshToken();

	const response = await fetch(`/api/recipes/${slug}`, {
		method: "PUT",
		body: JSON.stringify(recipe),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	await failOnNonOk(response);

	return await response.json();
}
