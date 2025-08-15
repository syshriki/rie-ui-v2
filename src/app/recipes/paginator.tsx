"use client";
import clsx from "clsx";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./paginator.module.css";

type PaginatorProps = {
	totalPages: number;
	totalItems: number;
	currentPage: number;
	pageNumbersToShow: number;
	className?: string;
};

export default function Paginator({
	totalPages,
	totalItems,
	currentPage,
	pageNumbersToShow,
	className,
}: PaginatorProps) {
	const searchParams = useSearchParams();
	if (totalItems === 0) {
		return null;
	}

	const createQueryObject = (page: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", page.toString());

		const queryObj: Record<string, string> = {};
		params.forEach((value, key) => {
			queryObj[key] = value;
		});

		return queryObj;
	};

	const endPageRange = Math.min(
		Math.max(currentPage, pageNumbersToShow / 2) +
			Math.round(pageNumbersToShow / 2),
		totalPages,
	);

	const availablePagesToShow = Math.min(pageNumbersToShow, endPageRange);

	return (
		<div className={clsx(className)}>
			<nav aria-label="pagination" className={styles.nav}>
				<ul className={styles.pagination}>
					<li className={clsx({ [styles.hidden]: currentPage === 1 })}>
						<img src="/rie_loaf.svg" aria-label="selected indicator" />
						<Link
							href={{
								query: createQueryObject(currentPage - 1),
							}}
						>
							<span aria-hidden="true" aria-label="previous set of pages">
								&laquo;
							</span>
						</Link>
					</li>

					{Array.from(
						{ length: availablePagesToShow },
						(_, i) => endPageRange - i,
					)
						.reverse()
						.map((page) => (
							<li
								key={page}
								className={page === currentPage ? styles.active : ""}
								aria-current={page === currentPage ? "page" : undefined}
							>
								<img src="/rie_loaf.svg" aria-label="selected indicator" />
								<Link
									href={{
										query: createQueryObject(page),
									}}
								>
									{page}
								</Link>
							</li>
						))}

					<li
						className={clsx({
							[styles.hidden]: currentPage === totalPages,
						})}
					>
						<img src="/rie_loaf.svg" aria-label="selected indicator" />

						<Link
							href={{
								query: createQueryObject(currentPage + 1),
							}}
						>
							<span aria-hidden="true" aria-label="next set of pages">
								&raquo;
							</span>
						</Link>
					</li>
				</ul>
			</nav>
		</div>
	);
}
