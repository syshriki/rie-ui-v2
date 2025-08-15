"use client";

import clsx from "clsx";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
	deleteRecipe,
	getRecipe,
	getRecipeAnonymous,
} from "../../../api/client";
import type { Recipe, RecipeBySlug } from "../../../api/models";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Popover from "../../../components/Dialog/Dialog";
import Page from "../../../components/Page/Page";
import { useIsLoggedIn } from "../../../hooks/auth";
import styles from "./page.module.css";

export default function RecipePage() {
	const { slug } = useParams();

	const { isLoggedIn, userId } = useIsLoggedIn({});

	const [recipeData, setRecipeData] = useState<RecipeBySlug | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const fetchRecipe = async () => {
			try {
				setIsLoading(true);

				const data = isLoggedIn
					? await getRecipe(slug?.toString() || "")
					: await getRecipeAnonymous(slug?.toString() || "");

				setRecipeData(data);
			} catch (err) {
				console.error("Error fetching recipe:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchRecipe();
	}, [slug, isLoggedIn]);

	if (!slug?.toString()) {
		return null;
	}

	const deleteRecipeHandler = async (slug: string) => {
		setIsDeleting(true);
		try {
			await deleteRecipe(slug);
			window.location.href = "/recipes";
		} catch (err) {
			console.error("Error deleting recipe:", err);
		} finally {
			setIsDeletePopupOpen(false);
			setIsDeleting(false);
		}
	};

	return (
		<Page selected="recipes" headerText="" isLoggedIn={isLoggedIn}>
			<div className={styles.container}>
				<Card className={styles.card}>
					{!isLoading && recipeData && (
						<article className={clsx(styles.printable, styles.recipeContainer)}>
							<div className={styles.headerContainer}>
								<h2 className={styles.title}>{recipeData.title}</h2>
								<nav className={styles.controls}>
									<Button className={styles.editButton} onClick={window.print}>
										<img src="/print.svg" aria-label="Print Recipe" />
									</Button>
									{userId === recipeData.authorId ? (
										<>
											<Button
												className={styles.editButton}
												// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
												onClick={() => (window.location.href = `/edit/${slug}`)}
											>
												<img src="/edit.svg" aria-label="Edit Recipe" />
											</Button>
											<Button
												className={styles.editButton}
												onClick={() => setIsDeletePopupOpen(true)}
											>
												<img src="/delete.svg" aria-label="Delete Recipe" />
											</Button>
										</>
									) : null}
								</nav>
							</div>
							<p className={styles.description}>{recipeData.description}</p>
							<pre className={styles.recipe}>{recipeData.recipe}</pre>
							<i>
								Last edited by {recipeData.authorUsername} on{" "}
								{new Date(recipeData.createdAt).toLocaleString()}
							</i>
						</article>
					)}
				</Card>
			</div>
			<Popover isOpen={isDeletePopupOpen}>
				<p>Are you sure you want to delete this recipe?</p>
				<nav className={styles.deleteControls}>
					<Button
						size="medium"
						disabled={isDeleting}
						onClick={() => setIsDeletePopupOpen(false)}
					>
						Cancel
					</Button>
					<Button
						size="medium"
						disabled={isDeleting}
						onClick={() => deleteRecipeHandler(slug.toString())}
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</nav>
			</Popover>
		</Page>
	);
}
