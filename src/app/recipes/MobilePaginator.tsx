"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import clsx from "clsx";
import styles from "./mobilePaginator.module.css";
import Link from "next/link";

type PaginatorProps = {
	totalPages: number;
	totalItems: number;
	currentPage: number;
	className?: string;
};

export default function MobilePaginator({
	totalPages,
	totalItems,
	currentPage,
	className,
}: PaginatorProps) {
	const searchParams = useSearchParams();
	const router = useRouter();

	if (totalItems === 0) {
		return null; // No pagination if there are no items
	}

	// Create new URLSearchParams object from the current searchParams
	const createQueryString = (page: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", page.toString());
		return params.toString();
	};

	const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const page = Number.parseInt(e.target.value, 10);
		router.replace(`?${createQueryString(page)}`);
	};

	return (
		<div className={clsx(className)}>
			<nav aria-label="pagination" className={styles.nav}>
				<div className={styles.controls}>
					<Link
						href={`?${createQueryString(Math.max(1, currentPage - 1))}`}
						className={clsx(styles.navButton, styles.prevButton, {
							[styles.disabled]: currentPage === 1,
						})}
						aria-disabled={currentPage === 1}
						aria-label="Previous page"
					>
						<span aria-hidden="true">«</span>
					</Link>

					<div className={styles.pageSelector}>
						<select
							value={currentPage}
							onChange={handlePageChange}
							className={styles.pageDropdown}
							aria-label="Select page"
						>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								(page) => (
									<option key={page} value={page}>
										{page} of {totalPages}
									</option>
								),
							)}
						</select>
					</div>

					<Link
						href={`?${createQueryString(Math.min(totalPages, currentPage + 1))}`}
						className={clsx(styles.navButton, styles.nextButton, {
							[styles.disabled]: currentPage === totalPages,
						})}
						aria-disabled={currentPage === totalPages}
						aria-label="Next page"
					>
						<span aria-hidden="true">»</span>
					</Link>
				</div>
			</nav>
		</div>
	);
}
