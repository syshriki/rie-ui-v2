"use client";
import type React from "react";
import styles from "./corner.module.css";

const Corner: React.FC = () => {
	return (
		<div className={styles.corner}>
			<img src="/rie.svg" aria-label="Rie Logo" />
		</div>
	);
};

export default Corner;
