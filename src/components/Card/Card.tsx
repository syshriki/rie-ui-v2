"use client";
import type React from "react";
import clsx from "clsx";
import styles from "./card.module.css";

interface CardProps {
	children: React.ReactNode;
	className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
	return <div className={clsx(className, styles.card)}>{children}</div>;
};

export default Card;
