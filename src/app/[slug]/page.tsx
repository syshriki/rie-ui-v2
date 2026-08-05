"use client";

import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
	deleteRecipe,
	getRecipe,
	getRecipeAnonymous,
} from "../../api/sdk";
import type { RecipeWithAuthor, RecipeWithAuthorAnon } from "../../api/sdk";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import Popover from "../../components/Dialog/Dialog";
import Page from "../../components/Page/Page";
import { useIsLoggedIn } from "../../hooks/auth";
import styles from "./page.module.css";

function print() {
	if (typeof window === "undefined") {
		console.error("Print function called outside of browser context");
		return;
	}

	try {
		if (!document.execCommand("print", false, undefined)) {
			window.print();
		}
	} catch {
		window.print();
	}
}
export default function RecipePage() {
	const { slug } = useParams();
	const router = useRouter();

	const { isLoggedIn, userId } = useIsLoggedIn();

	const [recipeData, setRecipeData] = useState<RecipeWithAuthor | RecipeWithAuthorAnon | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

	useEffect(() => {
		const requestWakeLock = async () => {
			if ("wakeLock" in navigator) {
				try {
					const lock = await navigator.wakeLock.request("screen");
					setWakeLock(lock);
				} catch (err) {
					console.warn("Wake lock request failed:", err);
				}
			}
		};

		requestWakeLock();

		return () => {
			if (wakeLock) {
				wakeLock.release();
				setWakeLock(null);
			}
		};
	}, [wakeLock]);

	useEffect(() => {
		const fetchRecipe = async () => {
			try {
				setIsLoading(true);

				const result = isLoggedIn
					? await getRecipe({ path: { slug: slug?.toString() || "" } })
					: await getRecipeAnonymous({ path: { slug: slug?.toString() || "" } });

				if (result.error) {
					console.error("Error fetching recipe:", result.error);
				} else {
					setRecipeData(result.data);
				}
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
			const result = await deleteRecipe({ path: { slug } });
			if (result.error) {
				console.error("Error deleting recipe:", result.error);
			} else {
				router.push("/recipes");
			}
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
						<article className={clsx(styles.recipeContainer)}>
							<div className={styles.headerContainer}>
								<h2 className={styles.title}>{recipeData.title}</h2>
								<nav className={styles.desktopControls}>
									<Button className={styles.editButton} onClick={() => print()}>
										<img src="/print.svg" aria-label="Print Recipe" />
									</Button>
									{userId === recipeData.authorId ? (
										<>
											<Button
												className={styles.editButton}
												onClick={() => router.push(`/edit/${slug}`)}
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
							<nav className={styles.mobileControls}>
								<Button
									className={styles.editButton}
									onClick={() =>
										typeof window !== "undefined" && window.print()
									}
								>
									<img src="/print.svg" aria-label="Print Recipe" />
								</Button>
								{userId === recipeData.authorId ? (
									<>
										<Button
											className={styles.editButton}
											onClick={() => router.push(`/edit/${slug}`)}
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
