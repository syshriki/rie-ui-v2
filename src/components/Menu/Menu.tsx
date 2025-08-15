"use client";
import clsx from "clsx";
import { type ReactNode, forwardRef, useEffect } from "react";
import styles from "./menu.module.css";

interface MenuProps {
	/** React elements to render inside the menu */
	children: ReactNode;
	/** Optional CSS class name to apply to the menu container */
	menuClassName?: string;
	/** Optional id for the menu element (for popover targeting) */
	menuId?: string;
	/** Optional callback for when the menu opens */
	onOpen?: () => void;
	/** Optional callback for when the menu closes */
	onClose?: () => void;
}

const Menu = forwardRef<HTMLDivElement, MenuProps>(
	({ children, menuClassName, menuId = "menu", onOpen, onClose }, ref) => {
		useEffect(() => {
			const popover = document.getElementById(menuId);
			if (!popover) return;

			const handleToggle = (event: Event) => {
				const toggleEvent = event as ToggleEvent;
				if (toggleEvent.newState === "open") {
					onOpen?.();
				} else {
					onClose?.();
				}
			};

			popover.addEventListener("toggle", handleToggle);
			return () => {
				popover.removeEventListener("toggle", handleToggle);
			};
		}, [menuId, onOpen, onClose]);

		return (
			<menu
				id={menuId}
				popover="auto"
				role="menu"
				className={clsx(styles.menu, menuClassName)}
				ref={ref}
			>
				<div className={styles.menuContent}>{children}</div>
			</menu>
		);
	},
);

Menu.displayName = "Menu";

export default Menu;
