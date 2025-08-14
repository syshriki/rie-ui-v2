"use client";
import type React from "react";
import clsx from "clsx";
import styles from "./paper.module.css";

interface PaperProps {
	children: React.ReactNode;
	className?: string;
}

const Paper: React.FC<PaperProps> = ({ children, className }) => {
	return <div className={clsx(styles.paper, className)}>{children}</div>;
};

export default Paper;
