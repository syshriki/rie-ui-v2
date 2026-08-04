import type React from "react";
import styles from "./ErrorText.module.css";

interface ErrorTextProps {
	children: React.ReactNode;
	className?: string;
}

const ErrorText: React.FC<ErrorTextProps> = ({ children, className }) => (
	<p className={`${styles.error} ${className ?? ""}`}>{children}</p>
);

export default ErrorText;
