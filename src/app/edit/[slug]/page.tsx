"use client";
import Page from "../../../components/Page/Page";
import styles from "./page.module.css";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { getRecipe, updateRecipe } from "../../../api/sdk";
import type { CreateRecipeBody } from "../../../api/sdk";
import { useEffect, useState } from "react";
import { useIsLoggedIn } from "../../../hooks/auth";
import Button from "../../../components/Button/Button";

export default function EditPage() {
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
		reset,
	} = useForm<CreateRecipeBody>({
		mode: "onChange",
	});
	const { isLoggedIn } = useIsLoggedIn();

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
				const result = await getRecipe({ path: { slug: slug.toString() } });
				if (result.error) {
					console.error("Failed to fetch recipe:", result.error);
					router.push("/recipes");
				} else {
					reset({
						title: result.data.title,
						description: result.data.description ?? undefined,
						recipe: result.data.recipe,
					});
				}
			} catch (error) {
				console.error("Failed to fetch recipe:", error);
				router.push("/recipes");
			} finally {
				setIsLoadingRecipe(false);
			}
		};

		fetchRecipe();
	}, [slug, isLoggedIn, reset, router]);

	const onSubmit: SubmitHandler<CreateRecipeBody> = async (data) => {
		if (!slug) return;

		setIsSubmitting(true);
		try {
			const result = await updateRecipe({ path: { slug: slug.toString() }, body: data });
			if (result.error) {
				console.error("Failed to update recipe:", result.error);
			} else {
				router.push(`/${result.data.slug}`);
			}
		} catch (error) {
			console.error("Failed to update recipe:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isLoggedIn) {
		window.location.href = "/login?redirectUri=/edit";
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
