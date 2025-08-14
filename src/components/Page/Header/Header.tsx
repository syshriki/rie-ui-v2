"use client";
import type React from "react";
import styles from "./Header.module.css";

interface HeaderProps {
	children: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
	return (
		<div className={styles.header}>
			<h1>{children}</h1>
		</div>
	);
};

export default Header;
