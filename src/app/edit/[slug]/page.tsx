"use client";
import Page from "../../../components/Page/Page";
import styles from "./page.module.css";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { getRecipe, updateRecipe } from "../../../api/sdk";
import type { CreateRecipeBody } from "../../../api/sdk";
import { Suspense, useEffect, useState } from "react";
import { useIsLoggedIn } from "../../../hooks/auth";
import Button from "../../../components/Button/Button";
import ErrorText from "../../../components/ErrorText/ErrorText";

export default function EditPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<EditPageInner />
		</Suspense>
	);
}

function EditPageInner() {
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
		reset,
	} = useForm<CreateRecipeBody>({
		mode: "onChange",
	});
	const { isLoggedIn, isLoading: isAuthLoading } = useIsLoggedIn();

	const router = useRouter();
	const { slug } = useParams();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);

	// Redirect to login only after auth state has been synced from
	// localStorage (isAuthLoading === false), avoiding premature redirect
	// during the initial render before hydration is complete.
	useEffect(() => {
		if (!isAuthLoading && !isLoggedIn) {
			router.replace("/login?redirectUri=/edit");
		}
	}, [isLoggedIn, isAuthLoading, router]);

	useEffect(() => {
		if (isAuthLoading || !isLoggedIn) {
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
	}, [slug, isLoggedIn, isAuthLoading, reset, router]);

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

	// Show nothing while auth is loading or user is not logged in.
	// The useEffect above will redirect to /login if the user is
	// truly unauthenticated after auth state is synced.
	if (isAuthLoading || !isLoggedIn) {
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
