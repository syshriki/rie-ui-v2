import type { Page } from "@playwright/test";
import type { RecipeWithAuthor, RecipesPageResponse, UserProfile } from "../src/api/sdk";
import {
	MOCK_EMPTY_RECIPES,
	MOCK_PIZZA_RECIPE,
	MOCK_RECIPES,
	MOCK_RECIPES_PAGE_2,
	MOCK_RECIPE_DETAIL,
	MOCK_PROFILE,
} from "../src/mocks/fixtures";

export {
	MOCK_EMPTY_RECIPES,
	MOCK_PIZZA_RECIPE,
	MOCK_PROFILE,
	MOCK_RECIPES,
	MOCK_RECIPES_PAGE_2,
	MOCK_RECIPE_DETAIL,
};

/**
 * Intercepts all backend API calls made by the app and returns mock data so
 * tests run without a real backend.
 */
export async function mockApiRoutes(page: Page) {
	// Auth introspect — return 401 so the app treats the session as anonymous
	await page.route("**/auth/applications/*/oauth/introspect", (route) =>
		route.fulfill({ status: 401, body: "Unauthorized" }),
	);

	// Revoke endpoint — used by "Continue Anonymously" button
	await page.route("**/auth/applications/*/oauth/revoke", (route) =>
		route.fulfill({ status: 200, body: "" }),
	);

	// Anonymous recipe list + detail — differentiated by path depth
	// Note: SDK calls go directly to the API base URL (e.g. http://localhost:8001/api/anonymous/recipes)
	// rather than through the Next.js server at /api/anonymous/recipes
	await page.route("**/api/anonymous/recipes**", (route) => {
		const url = new URL(route.request().url());
		const pathSegments = url.pathname.split("/").filter(Boolean);
		const isDetailRequest = pathSegments.length > 3; // …/api/anonymous/recipes/:slug

		if (isDetailRequest) {
			return route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(MOCK_RECIPE_DETAIL),
			});
		}

		const q = url.searchParams.get("q") ?? "";
		if (q.length > 0 && /^z+$/i.test(q)) {
			return route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(MOCK_EMPTY_RECIPES),
			});
		}

		if (url.searchParams.get("page") === "2") {
			return route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(MOCK_RECIPES_PAGE_2),
			});
		}

		return route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify(MOCK_RECIPES),
		});
	});

	// Authenticated recipe list + detail — used when the user is logged in
	// (the app switches from /anonymous/recipes to /recipes based on auth state).
	// The route pattern excludes URLs containing "anonymous" so the two handlers
	// don't conflict.
	await page.route("**/api/recipes**", (route) => {
		const rawUrl = route.request().url();
		if (rawUrl.includes("/anonymous/")) return route.fallback();

		const url = new URL(rawUrl);
		const pathSegments = url.pathname.split("/").filter(Boolean);
		// …/api/recipes/:slug (detail) vs …/api/recipes (list)
		const isDetailRequest = pathSegments.length > 2;

		if (isDetailRequest) {
			return route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(MOCK_RECIPE_DETAIL),
			});
		}

		const q = url.searchParams.get("q") ?? "";
		if (q.length > 0 && /^z+$/i.test(q)) {
			return route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(MOCK_EMPTY_RECIPES),
			});
		}

		if (url.searchParams.get("page") === "2") {
			return route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(MOCK_RECIPES_PAGE_2),
			});
		}

		return route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify(MOCK_RECIPES),
		});
	});
}

/**
 * Simulates an authenticated user by setting localStorage and mocking the
 * user-related API endpoints. Call after {@link mockApiRoutes}.
 */
export async function mockAuthenticatedUser(page: Page, userId: string) {
	await page.addInitScript(
		({ id, expiresAt, refreshExpiresAt }) => {
			localStorage.setItem("userId", id);
			localStorage.setItem("expiresAt", expiresAt);
			localStorage.setItem("refreshExpiresAt", refreshExpiresAt);
		},
		{
			id: userId,
			expiresAt: new Date(Date.now() + 86400000).toString(),
			refreshExpiresAt: new Date(Date.now() + 86400000 * 7).toString(),
		},
	);

	// GET /users/me — return mock profile
	await page.route("**/users/me", async (route) => {
		if (route.request().method() === "GET") {
			return route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(MOCK_PROFILE),
			});
		}
		if (route.request().method() === "PATCH") {
			// Small delay so the UI loading state is observable in tests
			await new Promise((resolve) => setTimeout(resolve, 300));
			return route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					id: MOCK_PROFILE.id,
					username: "Updated User",
					createdAt: MOCK_PROFILE.createdAt,
				}),
			});
		}
		return route.fallback();
	});

	// DELETE /users/{id} — return 204
	await page.route("**/users/*", (route) => {
		if (route.request().method() === "DELETE") {
			return route.fulfill({ status: 204 });
		}
		return route.fallback();
	});
}
