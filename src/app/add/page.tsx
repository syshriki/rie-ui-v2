"use client";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { createRecipe } from "../../api/sdk";
import type { CreateRecipeBody } from "../../api/sdk";
import Button from "../../components/Button/Button";
import Field from "../../components/Form/Field";
import Form from "../../components/Form/Form";
import TextArea from "../../components/Form/TextArea";
import TextInput from "../../components/Form/TextInput";
import Page from "../../components/Page/Page";
import { useIsLoggedIn, useLoginRedirect } from "../../hooks/auth";

type AppRouter = ReturnType<typeof useRouter>;

// Main page component with Suspense boundary
export default function AddPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AddPageClient />
		</Suspense>
	);
}

// Client component that uses useSearchParams via useIsLoggedIn hook
function AddPageClient() {
	const router = useRouter();
	const { isLoggedIn, isLoading: isAuthLoading } = useIsLoggedIn();
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
	} = useForm<CreateRecipeBody>({ mode: "onChange" });

	const [isSubmitting, setIsSubmitting] = useState(false);

	// 1. Anonymous visitors go to login first, then come back here.
	useLoginRedirect({ redirectUri: "/add", isLoggedIn, isAuthLoading });

	// 2. Create the recipe, then land on its page.
	const saveRecipe = useRecipeCreator({ router, setIsSubmitting });

	// Hold the form back until the session has been confirmed. When it turns
	// out there is none, step 1 is already redirecting to the login screen.
	if (isAuthLoading || !isLoggedIn) {
		return null;
	}

	return (
		<Page selected="add" headerText="Add Recipe" isLoggedIn={isLoggedIn}>
			<Form
				onSubmit={handleSubmit(saveRecipe)}
				footer={
					<>
						<Button
							type="button"
							size="medium"
							variant="secondary"
							disabled={isSubmitting}
							onClick={() => router.push("/recipes")}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							size="medium"
							disabled={!isValid || isSubmitting}
							isLoading={isSubmitting}
							loadingText="Saving..."
						>
							Save
						</Button>
					</>
				}
			>
				<Field label="Recipe Name" required error={errors.title?.message}>
					<TextInput
						placeholder="Recipe Name"
						{...register("title", { required: "Recipe name is required" })}
					/>
				</Field>
				<Field label="Description" optional>
					<TextArea
						placeholder="Description (Optional)"
						{...register("description")}
					/>
				</Field>
				<Field label="Recipe" required error={errors.recipe?.message}>
					<TextArea
						size="large"
						placeholder="Recipe"
						{...register("recipe", { required: "Recipe text is required" })}
					/>
				</Field>
			</Form>
		</Page>
	);
}

/**
 * Step 2 — persist the new recipe and navigate to it.
 */
function useRecipeCreator({
	router,
	setIsSubmitting,
}: {
	router: AppRouter;
	setIsSubmitting: (isSubmitting: boolean) => void;
}): SubmitHandler<CreateRecipeBody> {
	return async (values) => {
		setIsSubmitting(true);
		try {
			const result = await createRecipe({ body: values });
			if (result.error) {
				console.error("Failed to create recipe:", result.error);
				return;
			}
			router.push(`/${result.data.slug}`);
		} catch (error) {
			console.error("Failed to post recipe:", error);
		} finally {
			setIsSubmitting(false);
		}
	};
}
