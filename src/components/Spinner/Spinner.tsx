import type React from "react";
import styles from "./Spinner.module.css";

interface SpinnerProps {
	size?: number;
	className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 16, className }) => (
	<span
		className={`${styles.spinner} ${className ?? ""}`}
		style={{ width: size, height: size }}
	/>
);

export default Spinner;
