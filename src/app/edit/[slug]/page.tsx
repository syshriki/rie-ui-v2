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
import ErrorText from "../../../components/ErrorText/ErrorText";

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
			router.replace("/login?redirectUri=/edit");
		}
	}, [isLoggedIn, router]);

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
		return null;
	}

	if (isLoadingRecipe) {
		return null;
	}

	const titleErrorId = "title-error";
	const recipeErrorId = "recipe-error";

	return (
		<Page selected="add" headerText="Edit Recipe" isLoggedIn={isLoggedIn}>
			<div>
				<form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
					<div className={styles.fieldGroup}>
						<label htmlFor="title" className={styles.label}>
							Recipe Name <span className={styles.required} aria-hidden="true">*</span>
							<span className={styles.srOnly}> (required)</span>
						</label>
						<textarea
							id="title"
							className={`${styles.input} ${styles.recipeName} ${errors.title ? styles.invalid : ""}`}
							placeholder="Enter recipe name"
							required
							aria-required="true"
							aria-invalid={!!errors.title}
							aria-describedby={errors.title ? titleErrorId : undefined}
							{...register("title", { required: "Recipe name is required" })}
						/>
						{errors.title && (
							<ErrorText id={titleErrorId} className={styles.fieldError}>
								{errors.title.message}
							</ErrorText>
						)}
					</div>
					<div className={styles.fieldGroup}>
						<label htmlFor="description" className={styles.label}>
							Description <span className={styles.optional}>(optional)</span>
						</label>
						<textarea
							id="description"
							className={`${styles.input} ${styles.description}`}
							placeholder="Brief description of the recipe"
							{...register("description")}
						/>
					</div>
					<div className={styles.fieldGroup}>
						<label htmlFor="recipe" className={styles.label}>
							Recipe <span className={styles.required} aria-hidden="true">*</span>
							<span className={styles.srOnly}> (required)</span>
						</label>
						<textarea
							id="recipe"
							className={`${styles.input} ${styles.recipe} ${errors.recipe ? styles.invalid : ""}`}
							placeholder="Enter the full recipe"
							required
							aria-required="true"
							aria-invalid={!!errors.recipe}
							aria-describedby={errors.recipe ? recipeErrorId : undefined}
							{...register("recipe", { required: "Recipe text is required" })}
						/>
						{errors.recipe && (
							<ErrorText id={recipeErrorId} className={styles.fieldError}>
								{errors.recipe.message}
							</ErrorText>
						)}
					</div>
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
