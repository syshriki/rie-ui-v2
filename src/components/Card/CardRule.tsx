"use client";
import clsx from "clsx";
import type React from "react";
import styles from "./cardRule.module.css";

interface CardRuleProps {
	children?: React.ReactNode;
	className?: string;
}

/**
 * A row that closes off a card: the rule runs the card's full width — edge to
 * edge, meeting the card's side borders — while the row's content keeps the
 * card's standard inset.
 *
 * The card must not pad its own content (`<PageCard padding="none">`) and the
 * sections above must carry the inset instead, otherwise the rule would float
 * inside the padding rather than span the card.
 */
const CardRule = ({ children, className }: CardRuleProps) => (
	<div className={clsx(styles.cardRule, className)}>{children}</div>
);

export default CardRule;
