"use client";
import debounce from "lodash/debounce";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { searchRecipes, searchRecipesAnonymous } from "../../api/sdk";
import type { RecipesPageResponse, RecipesPageResponseAnon } from "../../api/sdk";
import Card from "../../components/Card/Card";
import Page from "../../components/Page/Page";
import { useIsLoggedIn } from "../../hooks/auth";
import MobilePaginator from "./MobilePaginator";
import styles from "./page.module.css";
import Paginator from "./paginator";

// Client component that uses useSearchParams
function RecipesClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { isLoggedIn } = useIsLoggedIn({});

	const queryParam = searchParams.get("q") || "";
	const pageParam = searchParams.get("page");
	const currentPage = pageParam ? Number.parseInt(pageParam) : 1;

	const [searchQuery, setSearchQuery] = useState(queryParam);
	const [recipeResponse, setRecipeResponse] = useState<RecipesPageResponse | RecipesPageResponseAnon | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);

	const performSearch = useCallback(() => {
		const params = new URLSearchParams();
		if (searchQuery) params.set("q", searchQuery);
		params.set("page", "1"); // Reset to page 1 when searching
		router.replace(`/recipes?${params.toString()}`);
	}, [searchQuery, router]);

	const debouncedSearchFn = useCallback(
		debounce((query: string, currentQueryParam: string, search: () => void) => {
			if (query !== currentQueryParam && query.length >= 3) {
				search();
			}
		}, 300),
		[],
	);

	useEffect(() => {
		debouncedSearchFn(searchQuery, queryParam, performSearch);

		return () => {
			debouncedSearchFn.cancel();
		};
	}, [searchQuery, queryParam, performSearch, debouncedSearchFn]);

	useEffect(() => {
		setIsLoading(true);
		setRecipeResponse(null); // Clear stale results so the old page doesn't flash
		const fetchRecipes = isLoggedIn
			? searchRecipes({ query: { page: currentPage, q: queryParam, pageSize: 20 } })
			: searchRecipesAnonymous({ query: { page: currentPage, q: queryParam, pageSize: 20 } });

		fetchRecipes.then((result) => {
			if (result.error) {
				console.error("Error fetching recipes:", result.error);
			} else if (result.data && "pagination" in result.data) {
				setRecipeResponse(result.data);
			}
			setIsLoading(false);
		});
	}, [isLoggedIn, currentPage, queryParam]);

	useEffect(() => {
		setSearchQuery(queryParam);
	}, [queryParam]);

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
								onKeyDown={(e) => e.key === "Enter" && performSearch()}
								aria-label="Search recipes (typing 3 or more characters will search automatically)"
							/>
							<button
								className={styles.searchButton}
								onClick={performSearch}
								onKeyDown={(e) => e.key === "Enter" && performSearch()}
								aria-label="Submit"
								type="button"
							>
								<img src="/search.svg" alt="Search icon" />
							</button>
						</div>
						<section className={styles.resultContainer}>
							{isLoading && (
								<p className={styles.loadingText}>Loading...</p>
							)}

							{!isLoading && recipeResponse?.recipes.map((recipe) => (
								<div className={styles.result} key={recipe.id}>
									<Link href={`/${recipe.slug}`}>
										<img src="/asterisk.svg" aria-label="list item marker" />
										<h3>{recipe.title}</h3>
									</Link>
									<p>{recipe.description}</p>
								</div>
							))}

							{!isLoading && recipeResponse?.recipes.length === 0 && (
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

// Main page component with Suspense boundary
export default function RecipesPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<RecipesClient />
		</Suspense>
	);
}
