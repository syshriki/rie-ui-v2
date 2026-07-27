import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

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

	expect(request.url()).toContain(`http://localhost:8001/api/anonymous/recipes`);
	expect(request.url()).not.toContain(`http://localhost:8001/anonymous/recipes`);
});
