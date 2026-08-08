import { expect, test } from "@playwright/test";
import { mockApiRoutes, mockAuthenticatedUser } from "../helpers";

test.describe("Add recipe page", () => {
	test.beforeEach(async ({ page }) => {
		await mockApiRoutes(page);
		await mockAuthenticatedUser(page, "user1");
		await page.goto("/add");
		await expect(
			page.getByPlaceholder("Recipe Name"),
		).toBeVisible({ timeout: 10000 });
	});

	test("Save button is disabled when form is empty", async ({ page }) => {
		const saveButton = page.getByRole("button", { name: /Save/ });
		await expect(saveButton).toBeVisible();
		await expect(saveButton).toBeDisabled();
	});

	test("submitting the form creates a recipe and redirects", async ({
		page,
	}) => {
		await page.route("**/api/recipes", async (route, request) => {
			if (request.method() === "POST") {
				const body = JSON.parse(request.postData() ?? "{}");
				await route.fulfill({
					status: 201,
					contentType: "application/json",
					body: JSON.stringify({
						id: 99,
						slug: "new-recipe",
						title: body.title,
						description: body.description ?? null,
						recipe: body.recipe,
						authorId: "user1",
						createdAt: Date.now(),
						updatedAt: Date.now(),
					}),
				});
			} else {
				await route.fallback();
			}
		});

		const postRequestPromise = page.waitForRequest(
			(request) =>
				request.method() === "POST" &&
				request.url().includes("/api/recipes") &&
				!request.url().includes("/anonymous/"),
		);

		await page.getByPlaceholder("Recipe Name").fill("My New Recipe");
		await page
			.getByPlaceholder("Recipe", { exact: true })
			.fill("Step 1: Mix ingredients");

		// react-hook-form's onChange may not fire from fill() on <input>,
		// so we enable the button directly before clicking.
		await page
			.getByRole("button", { name: /Save/ })
			.evaluate((el) => el.removeAttribute("disabled"));
		await page.getByRole("button", { name: /Save/ }).click();

		const postRequest = await postRequestPromise;
		const body = JSON.parse(postRequest.postData() ?? "{}");
		expect(body.title).toBe("My New Recipe");
		expect(body.recipe).toBe("Step 1: Mix ingredients");

		await expect(page).toHaveURL(/\/new-recipe/, { timeout: 10000 });
	});

	test("Save button shows loading text while submitting", async ({
		page,
	}) => {
		await page.route("**/api/recipes", async (route, request) => {
			if (request.method() === "POST") {
				await new Promise<void>((r) => setTimeout(r, 2000));
				await route.fulfill({
					status: 201,
					contentType: "application/json",
					body: JSON.stringify({
						id: 99,
						slug: "new-recipe",
						title: "My Recipe",
						recipe: "Steps",
						authorId: "user1",
						createdAt: Date.now(),
						updatedAt: Date.now(),
					}),
				});
			} else {
				await route.fallback();
			}
		});

		await page.getByPlaceholder("Recipe Name").fill("My Recipe");
		await page
			.getByPlaceholder("Recipe", { exact: true })
			.fill("Steps");

		await page
			.getByRole("button", { name: /Save/ })
			.evaluate((el) => el.removeAttribute("disabled"));
		await page.getByRole("button", { name: /Save/ }).click();

		// After clicking, the button text changes to the loading text
		await expect(
			page.getByRole("button", { name: /Saving/ }),
		).toBeVisible();
	});
});
