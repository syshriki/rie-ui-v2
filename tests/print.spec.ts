import { expect, test } from "@playwright/test";
import { mockApiRoutes, MOCK_PIZZA_RECIPE } from "./helpers";

/**
 * Count the number of pages in a PDF buffer.
 * Chromium-generated PDFs store each page as a PDF object with '/Type /Page'
 * (singular). We match that token while excluding the parent '/Type /Pages'
 * dictionary node.
 */
function countPdfPages(pdf: Buffer): number {
	const str = pdf.toString("binary");
	return (str.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
}

test.describe("Print layout", () => {
	test.beforeEach(async ({ page }) => {
		await mockApiRoutes(page);

		// Override the detail route to return the pizza dough recipe for this slug
		await page.route("**/anonymous/recipes/pizza-dough", (route) =>
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(MOCK_PIZZA_RECIPE),
			}),
		);
	});

	test("pizza dough recipe prints on 1 or 2 pages", async ({ page }) => {
		await page.goto("/pizza-dough");

		// Wait for the recipe content to be fully rendered before printing
		await expect(
			page.getByRole("heading", { name: MOCK_PIZZA_RECIPE.title }),
		).toBeVisible({ timeout: 10000 });
		await expect(page.locator("pre[class*='recipe']")).toBeVisible();

		// Generate a PDF using A4 print dimensions — this honours the @media print
		// CSS rules defined in page.module.css (no sidebar, no controls, etc.)
		const pdf = await page.pdf({
			format: "A4",
			printBackground: false,
			margin: { top: "1cm", bottom: "1cm", left: "1cm", right: "1cm" },
		});

		const pageCount = countPdfPages(pdf);
		expect(
			pageCount,
			`Expected the recipe to fit on 1 or 2 printed pages, but got ${pageCount}`,
		).toBeGreaterThanOrEqual(1);
		expect(
			pageCount,
			`Expected the recipe to fit on 1 or 2 printed pages, but got ${pageCount}`,
		).toBeLessThanOrEqual(2);
	});
});
