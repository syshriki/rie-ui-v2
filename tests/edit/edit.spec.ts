import { expect, test } from "@playwright/test";
import { mockApiRoutes, mockAuthenticatedUser } from "../helpers";

test.describe("Edit recipe page", () => {
	test.beforeEach(async ({ page }) => {
		await mockApiRoutes(page);
		await mockAuthenticatedUser(page, "user1");

		// Mock PUT /recipes/{slug} — the update endpoint
		await page.route("**/api/recipes/*", async (route, request) => {
			if (request.method() === "PUT") {
				const body = JSON.parse(request.postData() ?? "{}");
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						id: 1,
						slug: "updated-recipe",
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

		await page.goto("/edit/pasta-carbonara");
	});

	test("form is pre-filled with existing recipe data", async ({ page }) => {
		const nameField = page.getByPlaceholder("Enter recipe name");
		await expect(nameField).toBeVisible({ timeout: 10000 });
		// The mock recipe detail has title "Pasta Carbonara"
		await expect(nameField).toHaveValue("Pasta Carbonara");
	});

	test("Update Recipe button is enabled when form is valid", async ({
		page,
	}) => {
		const updateButton = page.getByRole("button", { name: /Update Recipe/ });
		await expect(updateButton).toBeVisible({ timeout: 10000 });
		// Form is pre-filled with valid data, so the button should be enabled
		await expect(updateButton).toBeEnabled();
	});

	test("shows validation error when required field is cleared", async ({
		page,
	}) => {
		const nameField = page.getByPlaceholder("Enter recipe name");
		await expect(nameField).toBeVisible({ timeout: 10000 });

		// Clear the title field
		await nameField.fill("");

		// Blur the field to trigger validation
		await page
			.getByPlaceholder("Enter the full recipe")
			.click();

		await expect(
			page.getByText("Recipe name is required"),
		).toBeVisible();
	});

	test("submitting the form calls the update API and redirects", async ({
		page,
	}) => {
		const putRequestPromise = page.waitForRequest(
			(request) =>
				request.method() === "PUT" &&
				request.url().includes("/api/recipes/"),
		);

		const nameField = page.getByPlaceholder("Enter recipe name");
		await expect(nameField).toBeVisible({ timeout: 10000 });

		// Modify the title
		await nameField.fill("Updated Pasta");
		await page.getByRole("button", { name: /Update Recipe/ }).click();

		// Verify the PUT request body
		const putRequest = await putRequestPromise;
		const body = JSON.parse(putRequest.postData() ?? "{}");
		expect(body.title).toBe("Updated Pasta");

		// After successful update, redirect to the new slug
		await expect(page).toHaveURL(/\/updated-recipe/, { timeout: 10000 });
	});

	test("Update Recipe button shows loading state while submitting", async ({
		page,
	}) => {
		const nameField = page.getByPlaceholder("Enter recipe name");
		await expect(nameField).toBeVisible({ timeout: 10000 });

		// Delay the PUT response so we can observe the loading state
		await page.route("**/api/recipes/*", async (route, request) => {
			if (request.method() === "PUT") {
				await new Promise<void>((r) => setTimeout(r, 500));
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						id: 1,
						slug: "updated-recipe",
						title: "Updated Pasta",
						recipe: "Boil pasta.",
						authorId: "user1",
						createdAt: Date.now(),
						updatedAt: Date.now(),
					}),
				});
			} else {
				await route.fallback();
			}
		});

		await nameField.fill("Updated Pasta");
		await page.getByRole("button", { name: /Update Recipe/ }).click();

		// After clicking, the button text changes to the loading text
		await expect(
			page.getByRole("button", { name: /Updating/ }),
		).toBeVisible();
	});
});
