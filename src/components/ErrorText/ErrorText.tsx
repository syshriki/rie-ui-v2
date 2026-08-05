import type React from "react";
import styles from "./ErrorText.module.css";

interface ErrorTextProps {
	children: React.ReactNode;
	className?: string;
	id?: string;
}

const ErrorText: React.FC<ErrorTextProps> = ({ children, className, id }) => (
	<p id={id} className={`${styles.error} ${className ?? ""}`} role="alert">
		{children}
	</p>
);

export default ErrorText;
