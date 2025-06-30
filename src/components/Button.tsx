import type React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
	onClick?: () => void;
	className?: string;
	children: React.ReactNode;
	startImage?: string;
}

const Button: React.FC<ButtonProps> = ({
	onClick,
	className = "",
	children,
	startImage,
}) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`${className} ${styles.button}`}
		>
			{startImage && (
				<img src={startImage} alt="Button icon" className={styles.startImage} />
			)}
			{children}
		</button>
	);
};

export default Button;
