import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "../helpers";

test.describe("Terms page — layout", () => {
	test.describe("mobile (600x900)", () => {
		test.use({ viewport: { width: 600, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/terms");
		});

		test("shows mobile layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeVisible();
		});

		test("shows page content", async ({ page }) => {
			await expect(page.getByText("Last updated:")).toBeVisible();
			await expect(
				page.getByRole("heading", { name: "1. Acceptance of Terms" }),
			).toBeVisible();
			await expect(
				page.getByText(/SY&S Consulting/).first(),
			).toBeVisible();
			await expect(
				page.getByText(/shlomo@rie\.recipes/).first(),
			).toBeVisible();
		});
	});

	test.describe("tablet (900x900)", () => {
		test.use({ viewport: { width: 900, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/terms");
		});

		test("shows tablet layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "Terms of Service" }),
			).toBeHidden();
		});

		test("shows page content", async ({ page }) => {
			await expect(page.getByText("Last updated:")).toBeVisible();
			await expect(
				page.getByRole("heading", { name: "1. Acceptance of Terms" }),
			).toBeVisible();
			await expect(
				page.getByText(/SY&S Consulting/).first(),
			).toBeVisible();
			await expect(
				page.getByText(/shlomo@rie\.recipes/).first(),
			).toBeVisible();
		});
	});

	test.describe("desktop (1440x900)", () => {
		test.use({ viewport: { width: 1440, height: 900 } });

		test.beforeEach(async ({ page }) => {
			await mockApiRoutes(page);
			await page.goto("/terms");
		});

		test("shows desktop layout", async ({ page }) => {
			await expect(
				page.getByRole("button", { name: "Show Menu" }),
			).toBeHidden();
			await expect(
				page.getByRole("heading", { name: "Terms of Service" }),
			).toBeVisible();
		});

		test("shows page content", async ({ page }) => {
			await expect(
				page.getByRole("heading", { name: "Terms of Service" }),
			).toBeVisible();
			await expect(page.getByText("Last updated:")).toBeVisible();
			await expect(
				page.getByRole("heading", { name: "1. Acceptance of Terms" }),
			).toBeVisible();
			await expect(
				page.getByText(/SY&S Consulting/).first(),
			).toBeVisible();
			await expect(
				page.getByText(/shlomo@rie\.recipes/).first(),
			).toBeVisible();
		});
	});
});
