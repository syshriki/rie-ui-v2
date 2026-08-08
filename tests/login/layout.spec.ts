import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "../helpers";

test.describe("Login page — layout", () => {
	test.describe("mobile (600x900)", () => {
		test.use({ viewport: { width: 600, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/login");
		});

		test("shows auth buttons", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: /Continue With Facebook/i }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Continue With Reddit/i }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Continue Anonymously/i }),
			).toBeVisible();
		});

		test("shows secondary heading, hides Welcome", async ({ page }) => {
			await expect(
				page.getByRole("heading", { name: "Rie.recipes" }),
			).toBeVisible();
			await expect(
				page.getByRole("heading", { name: "Welcome" }),
			).toBeHidden();
		});

		test("Google and Yahoo buttons are disabled", async ({ page }) => {
			const google = page.getByRole("button", {
				name: /Continue With Google/i,
			});
			const yahoo = page.getByRole("button", {
				name: /Continue With Yahoo/i,
			});
			await expect(google).toBeDisabled();
			await expect(yahoo).toBeDisabled();
		});
	});

	test.describe("tablet (900x900)", () => {
		test.use({ viewport: { width: 900, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/login");
		});

		test("shows auth buttons", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: /Continue With Facebook/i }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Continue With Reddit/i }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Continue Anonymously/i }),
			).toBeVisible();
		});

		test("shows secondary heading, hides Welcome", async ({ page }) => {
			await expect(
				page.getByRole("heading", { name: "Rie.recipes" }),
			).toBeVisible();
			await expect(
				page.getByRole("heading", { name: "Welcome" }),
			).toBeHidden();
		});

		test("Google and Yahoo buttons are disabled", async ({ page }) => {
			const google = page.getByRole("button", {
				name: /Continue With Google/i,
			});
			const yahoo = page.getByRole("button", {
				name: /Continue With Yahoo/i,
			});
			await expect(google).toBeDisabled();
			await expect(yahoo).toBeDisabled();
		});
	});

	test.describe("desktop (1440x900)", () => {
		test.use({ viewport: { width: 1440, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/login");
		});

		test("shows auth buttons", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: /Continue With Facebook/i }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Continue With Reddit/i }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: /Continue Anonymously/i }),
			).toBeVisible();
		});

		test("shows Welcome heading", async ({ page }) => {
			await expect(
				page.getByRole("heading", { name: "Welcome" }),
			).toBeVisible();
		});

		test("Google and Yahoo buttons are disabled", async ({ page }) => {
			const google = page.getByRole("button", {
				name: /Continue With Google/i,
			});
			const yahoo = page.getByRole("button", {
				name: /Continue With Yahoo/i,
			});
			await expect(google).toBeDisabled();
			await expect(yahoo).toBeDisabled();
		});
	});
});
