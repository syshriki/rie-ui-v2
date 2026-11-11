"use client";
import clsx from "clsx";
import type React from "react";
import Card from "../../Card/Card";
import styles from "./pageCard.module.css";

interface PageCardProps {
	children: React.ReactNode;
	/**
	 * `inset` (the default) pads the card's content. Use `none` when the sections
	 * inside the card define their own inset — required for a `CardRule`, which
	 * has to reach the card's side borders.
	 */
	padding?: "inset" | "none";
	/**
	 * The page's own card styling — its max width, min height, text alignment.
	 * Widths belong to the page, not here: this component only knows the shared
	 * shell (centred, 80% → 90%, one breakpoint).
	 */
	className?: string;
}

/**
 * The card every page sits its content in: centred, 80% wide (90% on narrower
 * screens) at one shared breakpoint.
 *
 * `Card` supplies the frame and the `--card-padding` / rule tokens that the
 * card's sections inherit, so a page only decides its width and its inset.
 */
const PageCard = ({ children, padding = "inset", className }: PageCardProps) => (
	<div className={styles.pageCard}>
		<Card
			className={clsx(
				styles.card,
				padding === "inset" && styles.inset,
				className,
			)}
		>
			{children}
		</Card>
	</div>
);

export default PageCard;
