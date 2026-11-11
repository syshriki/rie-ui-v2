"use client";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { getRecipe, updateRecipe } from "../../../api/sdk";
import type { CreateRecipeBody } from "../../../api/sdk";
import Button from "../../../components/Button/Button";
import Field from "../../../components/Form/Field";
import Form from "../../../components/Form/Form";
import TextArea from "../../../components/Form/TextArea";
import TextInput from "../../../components/Form/TextInput";
import Page from "../../../components/Page/Page";
import Spinner from "../../../components/Spinner/Spinner";
import { useIsLoggedIn, useLoginRedirect } from "../../../hooks/auth";
import styles from "./page.module.css";

type AppRouter = ReturnType<typeof useRouter>;

export default function EditPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<EditPageInner />
		</Suspense>
	);
}

function EditPageInner() {
	const { slug } = useParams();
	const router = useRouter();
	const { isLoggedIn, isLoading: isAuthLoading } = useIsLoggedIn();
	const {
		register,
		handleSubmit,
		reset,
		formState: { isValid, errors },
	} = useForm<CreateRecipeBody>({ mode: "onChange" });

	const [isSubmitting, setIsSubmitting] = useState(false);

	// 1. Anonymous visitors never see the form — send them to login first.
	useLoginRedirect({ redirectUri: "/edit", isLoggedIn, isAuthLoading });

	// 2. Seed the form with the recipe being edited.
	const isLoadingRecipe = useLoadedRecipe({
		slug: slug?.toString(),
		isLoggedIn,
		isAuthLoading,
		reset,
		router,
	});

	// 3. Save the edits, then land on the updated recipe.
	const saveRecipe = useRecipeSaver({
		slug: slug?.toString(),
		router,
		setIsSubmitting,
	});

	// Hold the form back until the session has been confirmed. When it turns
	// out there is none, step 1 is already redirecting to the login screen.
	if (isAuthLoading || !isLoggedIn) {
		return null;
	}

	return (
		<Page selected="add" headerText="Edit Recipe" isLoggedIn={isLoggedIn}>
			{isLoadingRecipe ? (
				<div className={styles.loading}>
					<Spinner size={32} />
				</div>
			) : (
				<Form
					onSubmit={handleSubmit(saveRecipe)}
					footer={
						<>
							<Button
								type="button"
								size="medium"
								variant="secondary"
								disabled={isSubmitting}
								onClick={() => router.push(`/${slug}`)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								size="medium"
								disabled={!isValid || isSubmitting}
								isLoading={isSubmitting}
								loadingText="Updating..."
							>
								Update Recipe
							</Button>
						</>
					}
				>
					<Field label="Recipe Name" required error={errors.title?.message}>
						<TextInput
							placeholder="Enter recipe name"
							{...register("title", {
								required: "Recipe name is required",
							})}
						/>
					</Field>
					<Field label="Description" optional>
						<TextArea
							placeholder="Brief description of the recipe"
							{...register("description")}
						/>
					</Field>
					<Field label="Recipe" required error={errors.recipe?.message}>
						<TextArea
							size="large"
							placeholder="Enter the full recipe"
							{...register("recipe", { required: "Recipe text is required" })}
						/>
					</Field>
				</Form>
			)}
		</Page>
	);
}

/**
 * Step 2 — fetch the recipe and fill in the form. Returns whether the recipe is
 * still on its way. A missing or unreadable recipe sends the user to the list.
 */
function useLoadedRecipe({
	slug,
	isLoggedIn,
	isAuthLoading,
	reset,
	router,
}: {
	slug: string | undefined;
	isLoggedIn: boolean;
	isAuthLoading: boolean;
	reset: (values: CreateRecipeBody) => void;
	router: AppRouter;
}): boolean {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (isAuthLoading || !isLoggedIn) {
			return;
		}

		if (!slug) {
			router.push("/recipes");
			return;
		}

		let isCancelled = false;

		const loadRecipe = async () => {
			try {
				const result = await getRecipe({ path: { slug } });
				if (isCancelled) return;

				if (result.error) {
					console.error("Failed to fetch recipe:", result.error);
					router.push("/recipes");
					return;
				}

				reset({
					title: result.data.title,
					description: result.data.description ?? undefined,
					recipe: result.data.recipe,
				});
			} catch (error) {
				if (isCancelled) return;
				console.error("Failed to fetch recipe:", error);
				router.push("/recipes");
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		};

		loadRecipe();

		return () => {
			isCancelled = true;
		};
	}, [slug, isLoggedIn, isAuthLoading, reset, router]);

	return isLoading;
}

/**
 * Step 3 — persist the form values and navigate to the saved recipe.
 */
function useRecipeSaver({
	slug,
	router,
	setIsSubmitting,
}: {
	slug: string | undefined;
	router: AppRouter;
	setIsSubmitting: (isSubmitting: boolean) => void;
}): SubmitHandler<CreateRecipeBody> {
	return async (values) => {
		if (!slug) return;

		setIsSubmitting(true);
		try {
			const result = await updateRecipe({ path: { slug }, body: values });
			if (result.error) {
				console.error("Failed to update recipe:", result.error);
				return;
			}
			router.push(`/${result.data.slug}`);
		} catch (error) {
			console.error("Failed to update recipe:", error);
		} finally {
			setIsSubmitting(false);
		}
	};
}
