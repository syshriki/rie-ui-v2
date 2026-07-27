import { expect, test } from "@playwright/test";
import { mockApiRoutes, mockAuthenticatedUser } from "./helpers";

test.describe("Profile page", () => {
	test.beforeEach(async ({ page }) => {
		await mockApiRoutes(page);
		await mockAuthenticatedUser(page, "test-user-1");
		await page.goto("/profile");
	});

	test("displays username and member since date", async ({ page }) => {
		await expect(page.getByText("Test User")).toBeVisible();
		await expect(
			page.getByText(/Member since/i),
		).toBeVisible();
	});

	test("shows recipe and favorite counts", async ({ page }) => {
		await expect(page.getByText("5")).toBeVisible();
		await expect(page.getByText("12")).toBeVisible();
		await expect(
			page.getByRole("main").getByText("Recipes", { exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("main").getByText("Favorites", { exact: true }),
		).toBeVisible();
	});

	test("shows the Delete My Account button", async ({ page }) => {
		await expect(
			page.getByRole("button", { name: /Delete My Account/i }),
		).toBeVisible();
	});

	test("clicking Delete opens confirmation dialog", async ({ page }) => {
		await page
			.getByRole("button", { name: /Delete My Account/i })
			.click();

		await expect(
			page.getByText(/Are you sure you want to delete your account/i),
		).toBeVisible();
		await expect(
			page.getByText(
				/This will permanently remove all your recipes/i,
			),
		).toBeVisible();
	});

	test("Cancel button closes the dialog", async ({ page }) => {
		await page
			.getByRole("button", { name: /Delete My Account/i })
			.click();

		await expect(
			page.getByText(/Are you sure you want to delete your account/i),
		).toBeVisible();

		await page.getByRole("button", { name: /Cancel/i }).click();

		await expect(
			page.getByText(/Are you sure you want to delete your account/i),
		).not.toBeVisible();
	});

	test("Delete button calls backend API and logs out", async ({ page }) => {
		await page
			.getByRole("button", { name: /Delete My Account/i })
			.click();

		await expect(
			page.getByText(/Are you sure you want to delete your account/i),
		).toBeVisible();

		// Set up the request watcher before triggering the delete
		const deleteRequestPromise = page.waitForRequest(
			(request) =>
				request.method() === "DELETE" &&
				request.url().includes("/users/"),
		);

		await page.getByRole("button", { name: /^Delete$/ }).click();

		// Verify the DELETE request was actually made to the backend
		const deleteRequest = await deleteRequestPromise;
		expect(deleteRequest.method()).toBe("DELETE");

		// After successful delete, user is redirected to login
		await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
	});
});
