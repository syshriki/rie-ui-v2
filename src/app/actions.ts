"use server";

import { revalidatePath } from "next/cache";
import { createRecipe as createRecipeApi } from "../api/sdk";
import type { CreateRecipeBody } from "../api/sdk";

export async function createRecipe(formData: FormData): Promise<void> {
  const body: CreateRecipeBody = {
    title: formData.get("recipeName") as string,
    description: formData.get("description") as string,
    recipe: formData.get("recipe") as string,
  };

  const { data, error } = await createRecipeApi({ body });

  if (error) {
    throw new Error("Failed to create recipe");
  }

  revalidatePath(`/${data.slug}`);
}
