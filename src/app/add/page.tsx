"use client";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { createRecipe } from "../../api/sdk";
import type { CreateRecipeBody } from "../../api/sdk";
import Button from "../../components/Button/Button";
import Page from "../../components/Page/Page";
import { useIsLoggedIn } from "../../hooks/auth";
import styles from "./page.module.css";

// Client component that uses useSearchParams via useIsLoggedIn hook
function AddPageClient() {
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
	} = useForm<CreateRecipeBody>({
		mode: "onChange",
	});
	const { isLoggedIn, isLoading } = useIsLoggedIn({
		requiresLogin: true,
	});

	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const onSubmit: SubmitHandler<CreateRecipeBody> = async (data) => {
		setIsSubmitting(true);
		try {
			const result = await createRecipe({ body: data });
			if (result.error) {
				console.error("Failed to create recipe:", result.error);
			} else {
				router.push(`/${result.data.slug}`);
			}
		} catch (error) {
			console.error("Failed to post recipe:", error);
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
