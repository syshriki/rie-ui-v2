"use client";
import clsx from "clsx";
import styles from "./menuItem.module.css";

type MenuItemProps = {
	children: React.ReactNode;
	disabled?: boolean;
	onClick?: () => void;
};

const MenuItem = ({ children, disabled, onClick }: MenuItemProps) => {
	return (
		<button
			className={clsx(styles.clickable, disabled && styles.disabled)}
			onClick={onClick}
			disabled={disabled}
			type="button"
		>
			{children}
		</button>
	);
};

export default MenuItem;
