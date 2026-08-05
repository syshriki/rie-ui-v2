import styles from "./IconButton.module.css";
import clsx from "clsx";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
}

const IconButton = ({ children, className, ...props }: IconButtonProps) => (
	<button className={clsx(styles.iconButton, className)} {...props}>
		{children}
	</button>
);

export default IconButton;
