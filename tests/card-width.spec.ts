import { expect, test } from "@playwright/test";
import { mockApiRoutes, mockAuthenticatedUser } from "./helpers";

/**
 * The page card's width is owned by `PageCard` (`--page-card-width`), so every
 * page must render a card of exactly the same width — at every viewport. A page
 * that caps its card itself would silently drift from the rest, which is what
 * these tests guard against.
 */

const PAGES = [
	{ route: "/recipes", label: "recipes" },
	{ route: "/pasta-carbonara", label: "recipe detail" },
	{ route: "/privacy", label: "privacy" },
	{ route: "/terms", label: "terms" },
	{ route: "/not-found-page", label: "error" },
	{ route: "/add", label: "add recipe" },
	{ route: "/edit/pasta-carbonara", label: "edit recipe" },
	{ route: "/profile", label: "profile" },
];

const VIEWPORTS = [
	{ name: "wide (1600x900)", width: 1600 },
	{ name: "desktop (1440x900)", width: 1440 },
	{ name: "tablet (900x900)", width: 900 },
	{ name: "mobile (600x900)", width: 600 },
];

const cardWidth = (page: import("@playwright/test").Page) =>
	page.evaluate(() => {
		const card = document.querySelector<HTMLElement>(
			'[class*="pageCard-module"][class*="__card"]',
		);
		if (!card) throw new Error("no page card found");
		return Math.round(card.getBoundingClientRect().width);
	});

for (const viewport of VIEWPORTS) {
	test(`every page card is the same width — ${viewport.name}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: viewport.width, height: 900 });
		await mockApiRoutes(page);
		await mockAuthenticatedUser(page, "chef");

		const widths = new Map<string, number>();
		for (const { route, label } of PAGES) {
			await page.goto(route);
			await page.waitForSelector('[class*="pageCard-module"]');
			widths.set(label, await cardWidth(page));
		}

		const distinct = [...new Set(widths.values())];
		expect(
			distinct,
			`card widths differ: ${[...widths].map(([label, w]) => `${label}=${w}px`).join(", ")}`,
		).toHaveLength(1);
	});
}
