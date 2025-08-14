"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Page from "../../components/Page/Page";
import { useIsLoggedIn } from "../../hooks/auth";
import { getRecipes, getRecipesAnonymous } from "../../api/client";
import type { RecipeResponse, Recipe } from "../../api/models";
import styles from "./page.module.css";
import Card from "../../components/Card/Card";
import Paginator from "./paginator";
import MobilePaginator from "./MobilePaginator";
import Link from "next/link";

export default function RootLayout() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { isLoggedIn } = useIsLoggedIn({});

	const queryParam = searchParams.get("q") || "";
	const pageParam = searchParams.get("page");
	const currentPage = pageParam ? Number.parseInt(pageParam) : 1;

	const [searchQuery, setSearchQuery] = useState(queryParam);
	const [recipeResponse, setRecipeResponse] = useState<RecipeResponse | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		if (isLoggedIn) {
			getRecipes({ page: currentPage, query: queryParam, pageSize: 20 }).then(
				(response: RecipeResponse) => {
					setRecipeResponse(response);
					setIsLoading(false);
				},
			);
		} else {
			getRecipesAnonymous({
				page: currentPage,
				query: queryParam,
				pageSize: 20,
			}).then((response: RecipeResponse) => {
				setRecipeResponse(response);
				setIsLoading(false);
			});
		}
	}, [isLoggedIn, currentPage, queryParam]);

	useEffect(() => {
		setSearchQuery(queryParam);
	}, [queryParam]);

	const handleSearch = () => {
		const params = new URLSearchParams();
		if (searchQuery) params.set("q", searchQuery);
		params.set("page", "1"); // Reset to page 1 when searching
		router.replace(`/recipes?${params.toString()}`);
	};

	return (
		<Page selected="recipes" headerText="Recipes" isLoggedIn={isLoggedIn}>
			<div className={styles.container}>
				<Card className={styles.card}>
					<search className={styles.search}>
						<div className={styles.searchContainer}>
							<input
								id="recipe-search"
								className={styles.searchBox}
								type="search"
								placeholder="Search recipes..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSearch()}
								aria-label="Search recipes"
							/>
							<button
								className={styles.searchButton}
								onClick={handleSearch}
								onKeyDown={(e) => e.key === "Enter" && handleSearch()}
								aria-label="Submit"
								type="button"
							>
								<img src="/search.svg" alt="Search icon" />
							</button>
						</div>
						<section className={styles.resultContainer}>
							{recipeResponse?.recipes.map((recipe: Recipe) => (
								<div className={styles.result} key={recipe.id}>
									<Link href={`/recipes/${recipe.slug}`}>
										<img src="/asterisk.svg" aria-label="list item marker" />
										<h3>{recipe.title}</h3>
									</Link>
									<p>{recipe.description}</p>
								</div>
							))}

							{recipeResponse?.recipes.length === 0 && !isLoading && (
								<h3 aria-live="polite">No recipes found</h3>
							)}
						</section>
					</search>
					<Paginator
						totalPages={recipeResponse?.pagination.totalPages || 0}
						totalItems={recipeResponse?.pagination.totalItems || 0}
						currentPage={currentPage}
						pageNumbersToShow={10}
						className={styles.desktopPaginator}
					/>

					<MobilePaginator
						totalPages={recipeResponse?.pagination.totalPages || 0}
						totalItems={recipeResponse?.pagination.totalItems || 0}
						currentPage={currentPage}
						className={styles.mobilePaginator}
					/>
				</Card>
			</div>
		</Page>
	);
}
