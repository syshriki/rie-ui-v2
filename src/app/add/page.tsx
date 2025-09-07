"use client";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { postRecipe } from "../../api/client";
import Button from "../../components/Button/Button";
import Page from "../../components/Page/Page";
import { useIsLoggedIn } from "../../hooks/auth";
import type { CreateRecipeRequest } from "../../models/Recipe";
import styles from "./page.module.css";

// Client component that uses useSearchParams via useIsLoggedIn hook
function AddPageClient() {
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
	} = useForm<CreateRecipeRequest>({
		mode: "onChange",
	});
	const { isLoggedIn, isLoading } = useIsLoggedIn({
		requiresLogin: true,
	});

	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const onSubmit: SubmitHandler<CreateRecipeRequest> = async (data) => {
		setIsSubmitting(true);
		try {
			const recipe = await postRecipe(data);
			router.push(`/recipes/${recipe.slug}`);
		} catch (error) {
			//console.error("Failed to post recipe:", error);
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

	return (
		<Page selected="add" headerText="Add Recipe" isLoggedIn={isLoggedIn}>
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
						loadingText="Saving..."
					>
						Save
					</Button>
				</form>
			</div>
		</Page>
	);
}

// Main page component with Suspense boundary
export default function AddPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AddPageClient />
		</Suspense>
	);
}
