import { expect, test } from "@playwright/test";
import { mockApiRoutes, mockAuthenticatedUser } from "../helpers";

test.describe("Profile page — layout", () => {
	test.describe("mobile (600x900)", () => {
		test.use({ viewport: { width: 600, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await mockAuthenticatedUser(page, "test-user-1");
			await page.goto("/profile");
		});

		test("shows mobile layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeVisible();
		});

		test("shows page content", async ({ page }) => {
			await expect(page.getByText("Test User")).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Delete My Account/i }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: "Edit username" }),
			).toBeVisible();
			await expect(
				page.getByText("5", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByText("12", { exact: true }),
			).toBeVisible();
		});
	});

	test.describe("tablet (900x900)", () => {
		test.use({ viewport: { width: 900, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await mockAuthenticatedUser(page, "test-user-1");
			await page.goto("/profile");
		});

		test("shows tablet layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "My Profile" }),
			).toBeHidden();
		});

		test("shows page content", async ({ page }) => {
			await expect(page.getByText("Test User")).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Delete My Account/i }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: "Edit username" }),
			).toBeVisible();
			await expect(
				page.getByText("5", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByText("12", { exact: true }),
			).toBeVisible();
		});
	});

	test.describe("desktop (1440x900)", () => {
		test.use({ viewport: { width: 1440, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await mockAuthenticatedUser(page, "test-user-1");
			await page.goto("/profile");
		});

		test("shows desktop layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "My Profile" }),
			).toBeVisible();
		});

		test("shows page content", async ({ page }) => {
			await expect(
				page.getByRole("heading", { name: "My Profile" }),
			).toBeVisible();
			await expect(page.getByText("Test User")).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Delete My Account/i }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: "Edit username" }),
			).toBeVisible();
			await expect(
				page.getByText("5", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByText("12", { exact: true }),
			).toBeVisible();
		});
	});
});
