"use client";

import clsx from "clsx";
import React, { type ForwardedRef, type ReactNode } from "react";
import styles from "./paper.module.css";

interface PaperProps {
	children: ReactNode;
	className?: string;
}

const Paper = React.forwardRef<HTMLDivElement, PaperProps>(
	({ children, className }, ref: ForwardedRef<HTMLDivElement>) => {
		return (
			<div ref={ref} className={clsx(styles.paper, className)}>
				{children}
			</div>
		);
	},
);

Paper.displayName = "Paper";

export default Paper;
