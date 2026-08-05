import { http, HttpResponse, delay } from "msw";
import * as db from "./db";

/** Inlined at build time by Next.js — 0 unless NEXT_PUBLIC_MOCK_DELAY is set. */
const MOCK_DELAY_MS = Number(process.env.NEXT_PUBLIC_MOCK_DELAY ?? "0");

async function applyDelay() {
  if (MOCK_DELAY_MS > 0) {
    await delay(MOCK_DELAY_MS);
  }
}

export const handlers = [
  // ── Anonymous recipes ──────────────────────────────────────────────
  http.get("*/api/anonymous/recipes", async ({ request }) => {
    await applyDelay();
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const page = Number(url.searchParams.get("page") ?? "1");
    if (q && /^z+$/i.test(q)) {
      return HttpResponse.json(db.emptyPage());
    }
    return HttpResponse.json(db.listRecipes({ page, q }));
  }),

  http.get("*/api/anonymous/recipes/:slug", async ({ params }) => {
    await applyDelay();
    const recipe = db.getRecipe(String(params.slug));
    if (!recipe) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    const { isFavorite: _, ...anon } = recipe;
    return HttpResponse.json(anon);
  }),

  // ── Authenticated recipes ──────────────────────────────────────────
  http.get("*/api/recipes", async ({ request }) => {
    await applyDelay();
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const page = Number(url.searchParams.get("page") ?? "1");
    if (q && /^z+$/i.test(q)) {
      return HttpResponse.json(db.emptyPage());
    }
    return HttpResponse.json(db.listRecipes({ page, q }));
  }),

  http.post("*/api/recipes", async ({ request }) => {
    await applyDelay();
    const body = await request.json();
    const recipe = db.createRecipe(body as { title: string; description?: string; ingredients?: string; recipe: string });
    return HttpResponse.json(recipe, { status: 201 });
  }),

  http.get("*/api/recipes/:slug", async ({ params }) => {
    await applyDelay();
    const recipe = db.getRecipe(String(params.slug));
    if (!recipe) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(recipe);
  }),

  http.put("*/api/recipes/:slug", async ({ params, request }) => {
    await applyDelay();
    const body = await request.json();
    const updated = db.updateRecipe(String(params.slug), body as { title: string; description?: string; ingredients?: string; recipe: string });
    if (!updated) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(updated);
  }),

  http.delete("*/api/recipes/:slug", async ({ params }) => {
    await applyDelay();
    db.deleteRecipe(String(params.slug));
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Favorites ──────────────────────────────────────────────────────
  http.post("*/api/recipes/:slug/favorite", async ({ params }) => {
    await applyDelay();
    const result = db.addFavorite(String(params.slug));
    if (!result) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(result);
  }),

  http.delete("*/api/recipes/:slug/favorite", async ({ params }) => {
    await applyDelay();
    db.removeFavorite(String(params.slug));
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Users (specific routes before parameterized) ───────────────────
  http.get("*/api/users/me", async () => {
    await applyDelay();
    return HttpResponse.json(db.getProfile());
  }),

  http.patch("*/api/users/me", async ({ request }) => {
    await applyDelay();
    const body = (await request.json()) as { username?: string };
    const updated = db.updateProfileUsername(body.username ?? "Updated User");
    return HttpResponse.json(updated);
  }),

  http.delete("*/api/users/:id", async () => {
    await applyDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("*/api/users/:id", async ({ params }) => {
    await applyDelay();
    const user = db.getUserEntity(String(params.id));
    if (!user) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.get("*/api/users/:id/favorites", async () => {
    await applyDelay();
    return HttpResponse.json(db.getFavorites());
  }),

  http.get("*/api/users/:id/recipes", async () => {
    await applyDelay();
    return HttpResponse.json(db.getUserRecipes());
  }),

  http.get("*/api/anonymous/users/:authorId/recipes", async () => {
    await applyDelay();
    return HttpResponse.json(db.getUserRecipesAnon());
  }),

  // ── News ───────────────────────────────────────────────────────────
  http.get("*/api/news", async () => {
    await applyDelay();
    return HttpResponse.json(db.listNews());
  }),

  http.post("*/api/news", async ({ request }) => {
    await applyDelay();
    const body = await request.json();
    const item = db.createNews(body as { title: string; text: string; type: string; recipeSlug?: string | null });
    return HttpResponse.json(item, { status: 201 });
  }),

  // ── Auth (plain fetch() from src/api/auth.ts — relative URLs) ─────
  http.post("*/auth/applications/1/oauth/token", async () => {
    await applyDelay();
    return HttpResponse.json({
      expiresAt: new Date(Date.now() + 86400000),
    });
  }),

  http.post("*/auth/applications/1/oauth/revoke", async () => {
    await applyDelay();
    return new HttpResponse(null, { status: 200 });
  }),
];
