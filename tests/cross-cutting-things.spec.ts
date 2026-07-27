import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

const API_BASE_URL = "http://localhost:8001";
const APP_BASE_URL = "http://localhost:3000";

test("SDK API calls target the API base URL, not the app origin", async ({
	page,
}) => {
	await mockApiRoutes(page);

	const requestPromise = page.waitForRequest(
		(request) =>
			request.method() === "GET" &&
			request.url().includes("/anonymous/recipes"),
	);

	await page.goto("/recipes");
	const request = await requestPromise;

	expect(request.url()).toContain(`${API_BASE_URL}/anonymous/recipes`);
	expect(request.url()).not.toContain(`${APP_BASE_URL}/anonymous/recipes`);
});
