import type { Page } from "@playwright/test";
import type { RecipeBySlug, RecipeResponse } from "../src/api/models";

const makePage1Recipes = () =>
Array.from({ length: 12 }, (_, i) => ({
slug: i === 0 ? "pasta-carbonara" : `recipe-p1-${i + 1}`,
id: i + 1,
title: i === 0 ? "Pasta Carbonara" : `Recipe P1-${i + 1}`,
description: i === 0 ? "A classic Italian pasta dish with eggs and pancetta." : `Description ${i + 1}.`,
recipe: i === 0 ? "Boil pasta. Fry pancetta. Mix eggs and cheese. Combine." : "Step 1. Step 2. Serve.",
authorId: "user1",
}));

const makePage2Recipes = () =>
Array.from({ length: 12 }, (_, i) => ({
slug: `recipe-p2-${i + 1}`,
id: 100 + i + 1,
title: `Recipe P2-${i + 1}`,
description: `Page 2 description ${i + 1}.`,
recipe: "Step 1. Step 2. Serve.",
authorId: "user1",
}));

export const MOCK_RECIPES: RecipeResponse = {
recipes: makePage1Recipes(),
pagination: {
hasMore: true,
nextCursor: null,
totalItems: 24,
totalPages: 2,
currentPage: 1,
},
};

export const MOCK_RECIPES_PAGE_2: RecipeResponse = {
recipes: makePage2Recipes(),
pagination: {
hasMore: false,
nextCursor: null,
totalItems: 24,
totalPages: 2,
currentPage: 2,
},
};

export const MOCK_EMPTY_RECIPES: RecipeResponse = {
recipes: [],
pagination: {
hasMore: false,
nextCursor: null,
totalItems: 0,
totalPages: 0,
currentPage: 1,
},
};

export const MOCK_PIZZA_RECIPE: RecipeBySlug = {
slug: "pizza-dough",
id: 99,
title: "24- to 48-Hour Pizza Dough",
description:
"Artisan 24-48 Hour Pizza Dough: Handcrafted, slow-fermented for a crispy, chewy crust with authentic, robust flavor.",
recipe: `24- to 48-Hour Pizza Dough

Ingredients:
- Water: 350g (1 2/3 cups), 70% baker's percentage
- Fine sea salt: 13g (scant 2 1/4 tsp), 2.6% baker's percentage
- Instant dried yeast: 1.5g (3/4 of 1/2 tsp), 0.3% baker's percentage
- White flour, preferably 00: 500g (scant 4 cups), 100% baker's percentage

Instructions:

1. Measure and Combine the Ingredients:
   - Use a digital scale to measure 350g of 90°F to 95°F (32°C to 35°C) water into a 6-quart dough tub.
   - Measure 13g of fine sea salt, add to the water, and stir or swish until dissolved.
   - Measure 1.5g (3/4 of 1/2 tsp) of instant dried yeast, add to the water, let it hydrate for a minute, then swish until dissolved.
   - Add 500g of flour (preferably 00) to the water-salt-yeast mixture.

2. Mix the Dough:
   - Mix by hand, stirring inside the dough tub to combine flour, water, salt, and yeast into a single mass.
   - Use the pincer method to cut the dough into sections with your hand, alternating with folding to develop it back into a unified mass.
   - Continue for 30 seconds to 1 minute. Target dough temperature is 80°F (27°C); check with a probe thermometer.

3. Knead and Rise:
   - Let the dough rest for 20 minutes.
   - Knead on a lightly floured surface for 30 seconds to 1 minute until the dough's skin is smooth.
   - Place the dough ball seam side down in a lightly oiled dough tub, cover with a tight-fitting lid, and let rise at room temperature (70°F to 74°F / 21°C to 23°C) for 2 hours.

4. Shape:
   - Moderately flour a 2-foot-wide work surface.
   - With floured hands, gently ease the dough out of the tub and onto the surface in an even shape.
   - Dust the top with flour, then cut into 3 or 5 equal pieces, depending on pizza style, using a scale for even dough balls.
   - Shape each piece into a medium-tight round, working gently to avoid tearing the dough. No floor time is needed before refrigeration.

5. Second Fermentation:
   - Place dough balls on one or two lightly floured dinner plates, leaving space for expansion.
   - Lightly flour the tops, cover tightly with plastic wrap, and refrigerate until ready to make pizza (ideally the next evening or the day after).

6. Make Pizza:
   - Remove dough balls from the fridge 60 to 90 minutes before making pizza.`,
authorId: "user1",
authorUsername: "chef",
createdAt: "2024-01-01T00:00:00Z",
};

export const MOCK_RECIPE_DETAIL: RecipeBySlug = {
slug: "pasta-carbonara",
id: 1,
title: "Pasta Carbonara",
description: "A classic Italian pasta dish with eggs and pancetta.",
recipe: "Boil pasta. Fry pancetta. Mix eggs and cheese. Combine.",
authorId: "user1",
authorUsername: "chef",
createdAt: "2024-01-01T00:00:00Z",
};

/**
 * Intercepts all backend API calls made by the app and returns mock data so
 * tests run without a real backend.
 */
export async function mockApiRoutes(page: Page) {
// Auth introspect — return 401 so the app treats the session as anonymous
await page.route("**/auth/applications/*/oauth/introspect", (route) =>
route.fulfill({ status: 401, body: "Unauthorized" }),
);

// Revoke endpoint — used by "Continue Anonymously" button
await page.route("**/auth/applications/*/oauth/revoke", (route) =>
route.fulfill({ status: 200, body: "" }),
);

// Anonymous recipe list + detail — differentiated by path depth
await page.route("**/api/anonymous/recipes**", (route) => {
const url = new URL(route.request().url());
const pathSegments = url.pathname.split("/").filter(Boolean);
const isDetailRequest = pathSegments.length > 3; // …/recipes/:slug

if (isDetailRequest) {
return route.fulfill({
status: 200,
contentType: "application/json",
body: JSON.stringify(MOCK_RECIPE_DETAIL),
});
}

const q = url.searchParams.get("q") ?? "";
if (q.length > 0 && /^z+$/i.test(q)) {
return route.fulfill({
status: 200,
contentType: "application/json",
body: JSON.stringify(MOCK_EMPTY_RECIPES),
});
}

if (url.searchParams.get("page") === "2") {
return route.fulfill({
status: 200,
contentType: "application/json",
body: JSON.stringify(MOCK_RECIPES_PAGE_2),
});
}

return route.fulfill({
status: 200,
contentType: "application/json",
body: JSON.stringify(MOCK_RECIPES),
});
});
}
