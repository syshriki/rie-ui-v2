import styles from "./button.module.css";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	isLoading?: boolean;
	loadingText?: string;
	size?: "small" | "medium" | "large" | "fullWidth";
	variant?: "primary" | "secondary";
	className?: string;
	children: React.ReactNode;
}

const Button = ({
	isLoading = false,
	loadingText = "Loading...",
	size = "large",
	variant = "primary",
	className,
	children,
	disabled,
	...props
}: ButtonProps) => {
	return (
		<button
			className={clsx(styles.button, styles[size], styles[variant], className)}
			disabled={isLoading || disabled}
			{...props}
		>
			{isLoading ? loadingText : children}
		</button>
	);
};

export default Button;
