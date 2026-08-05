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

import Card from "../../components/Card/Card";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import Page from "../../components/Page/Page";
import { EditIcon, DeleteIcon, PrintIcon } from "../../components/Icons/Icons";
import IconButton from "../../components/IconButton/IconButton";
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
	const wakeLockRef = useRef<WakeLockSentinel | null>(null);

	useEffect(() => {
		const requestWakeLock = async () => {
			if ("wakeLock" in navigator) {
				try {
					wakeLockRef.current = await navigator.wakeLock.request("screen");
				} catch (err) {
					console.warn("Wake lock request failed:", err);
				}
			}
		};

		requestWakeLock();

		return () => {
			if (wakeLockRef.current) {
				wakeLockRef.current.release();
				wakeLockRef.current = null;
			}
		};
	}, []);

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
									<IconButton
										onClick={() => print()}
										aria-label="Print Recipe"
									>
										<PrintIcon className={styles.icon} />
									</IconButton>
									{userId === recipeData.authorId ? (
										<>
											<IconButton
												onClick={() => router.push(`/edit/${slug}`)}
												aria-label="Edit Recipe"
											>
												<EditIcon className={styles.icon} />
											</IconButton>
											<IconButton
												onClick={() => setIsDeletePopupOpen(true)}
												aria-label="Delete Recipe"
											>
												<DeleteIcon className={styles.icon} />
											</IconButton>
										</>
									) : null}
								</nav>
							</div>
							<p className={styles.description}>{recipeData.description}</p>
							<pre className={styles.recipe}>{recipeData.recipe}</pre>
							<nav className={styles.mobileControls}>
								<IconButton
									onClick={() =>
										typeof window !== "undefined" && window.print()
									}
									aria-label="Print Recipe"
								>
									<PrintIcon size={28} />
								</IconButton>
								{userId === recipeData.authorId ? (
									<>
										<IconButton
											onClick={() => router.push(`/edit/${slug}`)}
										aria-label="Edit Recipe"
										>
											<EditIcon size={28} />
										</IconButton>
										<IconButton
											onClick={() => setIsDeletePopupOpen(true)}
										aria-label="Delete Recipe"
										>
											<DeleteIcon size={28} />
										</IconButton>
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
			<ConfirmDialog
				isOpen={isDeletePopupOpen}
				title="Are you sure you want to delete this recipe?"
				confirmText="Delete"
				onCancel={() => setIsDeletePopupOpen(false)}
				onConfirm={() => deleteRecipeHandler(slug.toString())}
				isConfirming={isDeleting}
				confirmingText="Deleting..."
			/>
		</Page>
	);
}
