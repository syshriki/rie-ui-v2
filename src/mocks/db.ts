import type {
  NewsEntity,
  NewsListResponse,
  RecipeEntity,
  RecipeFavoriteEntity,
  RecipeWithAuthor,
  RecipesPageResponse,
  UserEntity,
  UserProfile,
  UserRecipesResponse,
  FavoritesResponse,
  UserRecipesResponseAnon,
} from "../api/sdk";
import {
  MOCK_MODE_PROFILE,
  MOCK_MODE_USER_ID,
  MOCK_RECIPES,
  MOCK_RECIPES_PAGE_2,
  MOCK_PIZZA_RECIPE,
} from "./fixtures";

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  // De-duplicate: if a recipe with this slug already exists, append a suffix
  let candidate = base;
  let suffix = 1;
  while (recipes.some((r) => r.slug === candidate)) {
    suffix++;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

/** All recipes (seeded from fixtures). */
let recipes: RecipeWithAuthor[] = [
  ...(structuredClone(MOCK_RECIPES.recipes) as RecipeWithAuthor[]),
  ...(structuredClone(MOCK_RECIPES_PAGE_2.recipes) as RecipeWithAuthor[]),
  structuredClone(MOCK_PIZZA_RECIPE),
];

/** Favorited recipe IDs. */
const favorites = new Set<number>([99]); // pizza-dough is pre-favorited

/** Current user profile (mutable — updated by PATCH /users/me). */
let profile: UserProfile = structuredClone(MOCK_MODE_PROFILE);

/** Next recipe ID counter. */
let nextRecipeId = 200;

/** News items. */
const news: NewsEntity[] = [
  {
    id: 1,
    title: "Welcome to Rie Recipes!",
    text: "We're excited to launch our new recipe sharing platform. Start exploring delicious recipes from our community.",
    type: "announcement",
    authorId: "system",
    recipeSlug: null,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 2,
    title: "New Feature: Favorites",
    text: "You can now save your favorite recipes! Just click the heart icon on any recipe to add it to your favorites.",
    type: "feature",
    authorId: "system",
    recipeSlug: null,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Recipe of the Week: Pizza Dough",
    text: "Check out our 24-48 hour pizza dough recipe — it's been getting rave reviews!",
    type: "highlight",
    authorId: "system",
    recipeSlug: "pizza-dough",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

/** Next news ID counter. */
let nextNewsId = 4;

const PAGE_SIZE = 20;

export function listRecipes({
  page = 1,
  q = "",
}: {
  page?: number;
  q?: string;
}): RecipesPageResponse {
  let filtered = recipes;

  if (q) {
    const lower = q.toLowerCase();
    filtered = recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(lower) ||
        (r.description ?? "").toLowerCase().includes(lower),
    );
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const offset = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(offset, offset + PAGE_SIZE);

  return {
    recipes: paged,
    pagination: {
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export function emptyPage(): RecipesPageResponse {
  return {
    recipes: [],
    pagination: {
      currentPage: 1,
      pageSize: PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

export function getRecipe(slug: string): RecipeWithAuthor | undefined {
  return recipes.find((r) => r.slug === slug);
}

export function createRecipe(body: {
  title: string;
  description?: string;
  ingredients?: string;
  recipe: string;
}): RecipeEntity {
  const id = nextRecipeId++;
  const slug = slugify(body.title);
  const now = Date.now();
  const recipe: RecipeWithAuthor = {
    id,
    slug,
    title: body.title,
    description: body.description ?? null,
    recipe: body.recipe,
    authorId: MOCK_MODE_USER_ID,
    authorUsername: "chef",
    createdAt: now,
    updatedAt: now,
    isFavorite: false,
  };
  recipes.unshift(recipe);
  return recipe;
}

export function updateRecipe(
  slug: string,
  body: {
    title: string;
    description?: string;
    ingredients?: string;
    recipe: string;
  },
): RecipeEntity | undefined {
  const idx = recipes.findIndex((r) => r.slug === slug);
  if (idx === -1) return undefined;
  const updated: RecipeWithAuthor = {
    ...recipes[idx],
    title: body.title,
    description: body.description ?? recipes[idx].description,
    recipe: body.recipe,
    updatedAt: Date.now(),
  };
  recipes[idx] = updated;
  return updated;
}

export function deleteRecipe(slug: string): boolean {
  const idx = recipes.findIndex((r) => r.slug === slug);
  if (idx === -1) return false;
  recipes.splice(idx, 1);
  return true;
}

export function addFavorite(slug: string): RecipeFavoriteEntity | undefined {
  const recipe = recipes.find((r) => r.slug === slug);
  if (!recipe) return undefined;
  favorites.add(recipe.id);
  return {
    id: recipe.id,
    username: profile.username,
    recipeId: recipe.id,
    userId: MOCK_MODE_USER_ID,
    createdAt: Date.now(),
  };
}

export function removeFavorite(slug: string): boolean {
  const recipe = recipes.find((r) => r.slug === slug);
  if (!recipe) return false;
  return favorites.delete(recipe.id);
}

export function getFavorites(): FavoritesResponse {
  const favRecipes = recipes.filter((r) => favorites.has(r.id));
  return {
    recipes: favRecipes,
    hasMore: false,
    nextCursor: null,
  };
}

export function getUserRecipes(): UserRecipesResponse {
  const userRecipes = recipes.filter((r) => r.authorId === MOCK_MODE_USER_ID);
  return {
    recipes: userRecipes,
    hasMore: false,
    nextCursor: null,
  };
}

export function getUserRecipesAnon(): UserRecipesResponseAnon {
  const userRecipes = recipes.filter((r) => r.authorId === MOCK_MODE_USER_ID);
  // Strip isFavorite for anonymous responses
  return {
    recipes: userRecipes.map(({ isFavorite: _, ...rest }) => rest),
    hasMore: false,
    nextCursor: null,
  };
}

export function getProfile(): UserProfile {
  return { ...profile };
}

export function updateProfileUsername(username: string): UserEntity {
  profile = { ...profile, username };
  return {
    id: profile.id,
    username: profile.username,
    createdAt: profile.createdAt,
  };
}

export function getUserEntity(
  id: string,
): (UserProfile & { isCurrentUser: boolean }) | undefined {
  if (id === MOCK_MODE_USER_ID) {
    return { ...profile, isCurrentUser: true };
  }
  // Return a basic user for other IDs
  return {
    id,
    username: `user-${id}`,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 60,
    recipeCount: 3,
    favoriteCount: 7,
    isCurrentUser: false,
  };
}

export function listNews(): NewsListResponse {
  return {
    news: [...news],
    hasMore: false,
    nextCursor: null,
  };
}

export function createNews(body: {
  title: string;
  text: string;
  type: string;
  recipeSlug?: string | null;
}): NewsEntity {
  const item: NewsEntity = {
    id: nextNewsId++,
    title: body.title,
    text: body.text,
    type: body.type,
    authorId: MOCK_MODE_USER_ID,
    recipeSlug: body.recipeSlug ?? null,
    createdAt: new Date().toISOString(),
  };
  news.unshift(item);
  return item;
}
