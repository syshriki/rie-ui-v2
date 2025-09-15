"use client";
import clsx from "clsx";
import type React from "react";
import styles from "./corner.module.css";

const Corner: React.FC<{ className?: string }> = ({ className }) => {
	return (
		<div className={clsx(styles.corner, className)}>
			<img src="/rie.svg" aria-label="Rie Logo" />
		</div>
	);
};

export default Corner;
