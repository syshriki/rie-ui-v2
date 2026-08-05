import type { Page } from "@playwright/test";
import type { RecipeWithAuthor, RecipesPageResponse, UserProfile } from "../src/api/sdk";

const makePage1Recipes = () =>
	Array.from({ length: 12 }, (_, i) => ({
	slug: i === 0 ? "pasta-carbonara" : `recipe-p1-${i + 1}`,
	id: i + 1,
	title: i === 0 ? "Pasta Carbonara" : `Recipe P1-${i + 1}`,
	description: i === 0 ? "A classic Italian pasta dish with eggs and pancetta." : `Description ${i + 1}.`,
	recipe: i === 0 ? "Boil pasta. Fry pancetta. Mix eggs and cheese. Combine." : "Step 1. Step 2. Serve.",
	authorId: "user1",
	createdAt: Date.now(),
	updatedAt: Date.now(),
	isFavorite: false,
	}));

const makePage2Recipes = () =>
	Array.from({ length: 12 }, (_, i) => ({
	slug: `recipe-p2-${i + 1}`,
	id: 100 + i + 1,
	title: `Recipe P2-${i + 1}`,
	description: `Page 2 description ${i + 1}.`,
	recipe: "Step 1. Step 2. Serve.",
	authorId: "user1",
	createdAt: Date.now(),
	updatedAt: Date.now(),
	isFavorite: false,
	}));

export const MOCK_RECIPES: RecipesPageResponse = {
	recipes: makePage1Recipes(),
	pagination: {
	currentPage: 1,
	pageSize: 20,
	totalItems: 24,
	totalPages: 2,
	hasNextPage: true,
	hasPreviousPage: false,
	},
};

export const MOCK_RECIPES_PAGE_2: RecipesPageResponse = {
	recipes: makePage2Recipes(),
	pagination: {
	currentPage: 2,
	pageSize: 20,
	totalItems: 24,
	totalPages: 2,
	hasNextPage: false,
	hasPreviousPage: true,
	},
};

export const MOCK_EMPTY_RECIPES: RecipesPageResponse = {
	recipes: [],
	pagination: {
	currentPage: 1,
	pageSize: 20,
	totalItems: 0,
	totalPages: 0,
	hasNextPage: false,
	hasPreviousPage: false,
	},
};

export const MOCK_PIZZA_RECIPE: RecipeWithAuthor = {
	slug: "pizza-dough",
	id: 99,
	title: "24- to 48-Hour Pizza Dough",
	description:
	"Artisan 24-48 Hour Pizza Dough: Handcrafted, slow-fermented for a crispy, chewy crust with authentic, robust flavor.",
	recipe: `24- to 48-Hour Pizza Dough

	Ingredients:
	- Water: 350g (1 2/3 cups), 70% baker's percentage
	- Fine sea salt: 13g (scant 2 1/4 tsp), 2.6% baker's percentage
	- Instant dried yeast: 1.5g (3/4 of 1/2 tsp), 0.3% baker's percentage
	- White flour, preferably 00: 500g (scant 4 cups), 100% baker's percentage

	Instructions:

	1. Measure and Combine the Ingredients:
	   - Use a digital scale to measure 350g of 90°F to 95°F (32°C to 35°C) water into a 6-quart dough tub.
	   - Measure 13g of fine sea salt, add to the water, and stir or swish until dissolved.
	   - Measure 1.5g (3/4 of 1/2 tsp) of instant dried yeast, add to the water, let it hydrate for a minute, then swish until dissolved.
	   - Add 500g of flour (preferably 00) to the water-salt-yeast mixture.

	2. Mix the Dough:
	   - Mix by hand, stirring inside the dough tub to combine flour, water, salt, and yeast into a single mass.
	   - Use the pincer method to cut the dough into sections with your hand, alternating with folding to develop it back into a unified mass.
	   - Continue for 30 seconds to 1 minute. Target dough temperature is 80°F (27°C); check with a probe thermometer.

	3. Knead and Rise:
	   - Let the dough rest for 20 minutes.
	   - Knead on a lightly floured surface for 30 seconds to 1 minute until the dough's skin is smooth.
	   - Place the dough ball seam side down in a lightly oiled dough tub, cover with a tight-fitting lid, and let rise at room temperature (70°F to 74°F / 21°C to 23°C) for 2 hours.

	4. Shape:
	   - Moderately flour a 2-foot-wide work surface.
	   - With floured hands, gently ease the dough out of the tub and onto the surface in an even shape.
	   - Dust the top with flour, then cut into 3 or 5 equal pieces, depending on pizza style, using a scale for even dough balls.
	   - Shape each piece into a medium-tight round, working gently to avoid tearing the dough. No floor time is needed before refrigeration.

	5. Second Fermentation:
	   - Place dough balls on one or two lightly floured dinner plates, leaving space for expansion.
	   - Lightly flour the tops, cover tightly with plastic wrap, and refrigerate until ready to make pizza (ideally the next evening or the day after).

	6. Make Pizza:
	   - Remove dough balls from the fridge 60 to 90 minutes before making pizza.`,
	authorId: "user1",
	authorUsername: "chef",
	createdAt: 1704067200,
	updatedAt: 1704067200,
	isFavorite: false,
};

export const MOCK_RECIPE_DETAIL: RecipeWithAuthor = {
	slug: "pasta-carbonara",
	id: 1,
	title: "Pasta Carbonara",
	description: "A classic Italian pasta dish with eggs and pancetta.",
	recipe: "Boil pasta. Fry pancetta. Mix eggs and cheese. Combine.",
	authorId: "user1",
	authorUsername: "chef",
	createdAt: 1704067200,
	updatedAt: 1704067200,
	isFavorite: false,
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

export const MOCK_PROFILE: UserProfile = {
	id: "test-user-1",
	username: "Test User",
	createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
	recipeCount: 5,
	favoriteCount: 12,
};

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
