"use client";
import clsx from "clsx";
import Link from "next/link";
import type React from "react";
import styles from "./corner.module.css";

const Corner: React.FC<{ className?: string }> = ({ className }) => {
	return (
		<div className={clsx(styles.corner, className)}>
			<Link href="/">
				<img className={styles.img} src="/rie.svg" aria-label="Rie Logo" />
			</Link>
		</div>
	);
};

export default Corner;
