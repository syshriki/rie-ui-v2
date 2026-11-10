"use client";
import clsx from "clsx";
import styles from "./menuItem.module.css";

type MenuItemProps = {
	children: React.ReactNode;
	disabled?: boolean;
	selected?: boolean;
	onClick?: () => void;
};

const MenuItem = ({
	children,
	disabled,
	selected,
	onClick,
}: MenuItemProps) => {
	return (
		<button
			className={clsx(styles.clickable, {
				[styles.selected]: selected,
				[styles.disabled]: disabled,
			})}
			onClick={onClick}
			disabled={disabled}
			type="button"
		>
			{children}
		</button>
	);
};

export default MenuItem;
