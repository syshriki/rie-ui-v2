"use client";
import Page from "../../../components/Page/Page";
import styles from "./page.module.css";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import type { CreateRecipeRequest } from "../../../models/Recipe";
import { getRecipe, updateRecipe } from "../../../api/client";
import { useEffect, useState } from "react";
import { useIsLoggedIn } from "../../../hooks/auth";
import Button from "../../../components/Button/Button";

export default function EditPage() {
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
		reset,
	} = useForm<CreateRecipeRequest>({
		mode: "onChange",
	});
	const { isLoggedIn, isLoading } = useIsLoggedIn({
		requiresLogin: true,
	});

	const router = useRouter();
	const { slug } = useParams();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);

	useEffect(() => {
		if (!isLoggedIn) {
			return;
		}

		if (!slug) {
			router.push("/recipes");
			return;
		}

		const fetchRecipe = async () => {
			try {
				const recipe = await getRecipe(slug.toString());
				reset({
					title: recipe.title,
					description: recipe.description,
					recipe: recipe.recipe,
				});
			} catch (error) {
				console.error("Failed to fetch recipe:", error);
				router.push("/recipes");
			} finally {
				setIsLoadingRecipe(false);
			}
		};

		fetchRecipe();
	}, [slug, isLoggedIn, reset, router]);

	const onSubmit: SubmitHandler<CreateRecipeRequest> = async (data) => {
		if (!slug) return;

		setIsSubmitting(true);
		try {
			const recipe = await updateRecipe(slug.toString(), data);
			router.push(`/${recipe.slug}`);
		} catch (error) {
			console.error("Failed to update recipe:", error);
			// Optionally, handle the error (e.g., show a notification)
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return null;
	}

	if (!isLoggedIn) {
		return null;
	}

	if (isLoadingRecipe) {
		return null;
	}

	return (
		<Page selected="add" headerText="Edit Recipe" isLoggedIn={isLoggedIn}>
			<div>
				<form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
					<input
						type="text"
						className={`${styles.input} ${styles.recipeName}`}
						placeholder="Recipe Name"
						{...register("title", { required: true })}
					/>
					<textarea
						className={`${styles.input} ${styles.description}`}
						placeholder="Description (Optional)"
						{...register("description")}
					/>
					<textarea
						className={`${styles.input} ${styles.recipe}`}
						placeholder="Recipe"
						{...register("recipe", { required: true })}
					/>
					<Button
						type="submit"
						disabled={!isValid || isSubmitting}
						isLoading={isSubmitting}
						loadingText="Updating..."
					>
						Update Recipe
					</Button>
				</form>
			</div>
		</Page>
	);
}
