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
		await expect(page.getByText("5", { exact: true })).toBeVisible();
		await expect(page.getByText("12", { exact: true })).toBeVisible();
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

test.describe("Edit username", () => {
	test.beforeEach(async ({ page }) => {
		await mockApiRoutes(page);
		await mockAuthenticatedUser(page, "test-user-1");
		await page.goto("/profile");
	});

	test("edit button is visible next to username", async ({ page }) => {
		await expect(page.getByLabel("Edit username")).toBeVisible();
	});

	test("clicking edit shows input and Save/Cancel buttons", async ({ page }) => {
		await page.getByLabel("Edit username").click();

		await expect(page.getByRole("textbox")).toBeVisible();
		await expect(page.getByRole("textbox")).toHaveValue("Test User");
		await expect(
			page.getByRole("button", { name: "Save" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Cancel" }),
		).toBeVisible();
	});

	test("Cancel reverts to display mode", async ({ page }) => {
		await page.getByLabel("Edit username").click();
		await expect(page.getByRole("textbox")).toBeVisible();

		await page.getByRole("button", { name: "Cancel" }).click();

		await expect(page.getByRole("textbox")).not.toBeVisible();
		await expect(page.getByText("Test User")).toBeVisible();
		await expect(page.getByLabel("Edit username")).toBeVisible();
	});

	test("empty username shows error without calling API", async ({ page }) => {
		await page.getByLabel("Edit username").click();

		// Clear the input
		const input = page.getByRole("textbox");
		await input.fill("");

		await page.getByRole("button", { name: "Save" }).click();

		// Error should appear and edit mode should remain
		await expect(
			page.getByText("Username cannot be empty."),
		).toBeVisible();
		await expect(page.getByRole("textbox")).toBeVisible();
	});

	test("saving calls PATCH API and reloads", async ({ page }) => {
		await page.getByLabel("Edit username").click();

		const input = page.getByRole("textbox");
		await input.fill("New Username");

		const patchRequestPromise = page.waitForRequest(
			(request) =>
				request.method() === "PATCH" &&
				request.url().includes("/users/me"),
		);

		await page.getByRole("button", { name: "Save" }).click();

		// Verify the PATCH request was made
		const patchRequest = await patchRequestPromise;
		expect(patchRequest.method()).toBe("PATCH");
		const body = JSON.parse(patchRequest.postData() ?? "{}");
		expect(body.username).toBe("New Username");

		// After save, page reloads
		await page.waitForLoadState("load");
	});

	test("Save button shows loading state while request is in flight", async ({
		page,
	}) => {
		await page.getByLabel("Edit username").click();

		const input = page.getByRole("textbox");
		await input.fill("New Username");

		// Initiate save and immediately check for loading state
		const savePromise = page
			.getByRole("button", { name: "Saving..." })
			.waitFor({ state: "visible" });
		await page.getByRole("button", { name: "Save" }).click();
		await savePromise;

		// The Save button text should have changed to "Saving..."
		await expect(
			page.getByRole("button", { name: "Saving..." }),
		).toBeVisible();
	});
});
