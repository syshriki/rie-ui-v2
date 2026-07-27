import { expect, test } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.describe("Recipes list page", () => {
	test.beforeEach(async ({ page }) => {
		await mockApiRoutes(page);
		await page.goto("/recipes");
	});

	test("renders the search input", async ({ page }) => {
		await expect(page.getByRole("searchbox")).toBeVisible();
	});

	test("search input has correct placeholder", async ({ page }) => {
		await expect(page.getByRole("searchbox")).toHaveAttribute(
			"placeholder",
			"Search recipes...",
		);
	});

	test("search button is visible", async ({ page }) => {
		await expect(
			page.getByRole("button", { name: /Submit/i }),
		).toBeVisible();
	});

	test("typing fewer than 3 characters does not trigger navigation", async ({
		page,
	}) => {
		const initialUrl = page.url();
		await page.getByRole("searchbox").fill("ab");
		// wait briefly to ensure debounce would have fired
		await page.waitForTimeout(500);
		expect(page.url()).toBe(initialUrl);
	});

	test("typing 3+ characters updates the URL query param", async ({
		page,
	}) => {
		await page.getByRole("searchbox").fill("pasta");
		await page.waitForURL(/q=pasta/);
		expect(page.url()).toContain("q=pasta");
	});

	test("pressing Enter submits the search", async ({ page }) => {
		await page.getByRole("searchbox").fill("soup");
		await page.getByRole("searchbox").press("Enter");
		await page.waitForURL(/q=soup/);
		expect(page.url()).toContain("q=soup");
	});

	test("shows 'No recipes found' when search returns nothing", async ({
		page,
	}) => {
		await page.goto("/recipes?q=zzzzzzzzzzzzzzzzzzz");
		await expect(
			page.getByRole("heading", { name: /No recipes found/i }),
		).toBeVisible({ timeout: 10000 });
	});

	test("root path redirects to /recipes", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveURL(/\/recipes/);
	});

	test("clicking the next page button scrolls back to the top of the recipe list", async ({
		page,
	}) => {
		await page.goto("/recipes");

		const paginationNav = page.getByRole("navigation", { name: "pagination" });
		await expect(paginationNav.first()).toBeVisible({ timeout: 10000 });

		const nextLink = paginationNav.first().locator("a").filter({ hasText: "»" });

		// Scroll the container to the bottom, then click next and confirm the
		// new page starts at the top.
		await page.evaluate(() => {
			const container = document.querySelector<HTMLElement>('[class*="scrollableContainer"]');
			if (container) container.scrollTo(0, container.scrollHeight);
		});
		const scrollBefore = await page.evaluate(() => {
			const container = document.querySelector<HTMLElement>('[class*="scrollableContainer"]');
			return container?.scrollTop ?? 0;
		});
		expect(scrollBefore, "container should be scrolled down before clicking next").toBeGreaterThan(0);

		await nextLink.click();
		await page.waitForURL(/page=2/);

		// Wait for new content to fully render before checking scroll position.
		await expect(page.getByText("Recipe P2-1", { exact: true })).toBeVisible({ timeout: 5000 });

		const scrollAfter = await page.evaluate(() => {
			const container = document.querySelector<HTMLElement>('[class*="scrollableContainer"]');
			return container?.scrollTop ?? -1;
		});
		expect(scrollAfter, `scroll should be at top after navigating to page 2 (got ${scrollAfter})`).toBe(0);
	});

	test("shows a loading indicator while fetching a new page", async ({
		page,
	}) => {
		// Register a delayed handler for page=2 requests on top of the existing mock.
		// Playwright processes routes LIFO, so this runs first. For page=2 we hold
		// the response for 300 ms (enough to assert the loading state), then fulfill
		// it directly. All other requests fall through to the beforeEach mock.
		await page.route("**/anonymous/recipes**", async (route) => {
			const url = new URL(route.request().url());
			if (url.searchParams.get("page") === "2") {
				await new Promise<void>((r) => setTimeout(r, 300));
				const { MOCK_RECIPES_PAGE_2 } = await import("./helpers");
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(MOCK_RECIPES_PAGE_2),
				});
			} else {
				await route.fallback();
			}
		});

		const paginationNav = page.getByRole("navigation", { name: "pagination" });
		await expect(paginationNav.first()).toBeVisible({ timeout: 10000 });

		await paginationNav.first().locator("a").filter({ hasText: "»" }).click();
		await page.waitForURL(/page=2/);

		// Loading indicator should appear while the delayed response is in-flight.
		await expect(page.getByText("Loading...")).toBeVisible({ timeout: 2000 });

		// Once the response arrives the indicator disappears and results show.
		await expect(page.getByText("Loading...")).not.toBeVisible({ timeout: 2000 });
		await expect(page.getByText("Recipe P2-1", { exact: true })).toBeVisible({ timeout: 2000 });
	});
});
