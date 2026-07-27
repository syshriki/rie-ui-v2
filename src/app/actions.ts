"use server";

import { revalidatePath } from "next/cache";
import type { CreateRecipeBody } from "../api/sdk";

export async function createRecipe(formData: FormData): Promise<void> {
  const recipeData: CreateRecipeBody = {
    title: formData.get("recipeName") as string,
    description: formData.get("description") as string,
    recipe: formData.get("recipe") as string
  };

  const response = await fetch(`${process.env.API_URL || ""}/api/recipe`, {
    method: "POST",
    body: JSON.stringify(recipeData),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to create recipe");
  }

  const responseData = await response.json();

  revalidatePath(`/${responseData.slug}`);
}
