"use client";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface MenuProps {
	children: ReactNode;
	className?: string;
	menuId?: string;
	onOpen?: () => void;
	onClose?: () => void;
}

/**
 * Popover wrapper. Presentation lives with the consumer — the only menu in the
 * app is the mobile one (see Page/MobileTopBar/mobileTopBar.module.css).
 *
 * Rendered through a portal onto <body>: inside the sticky top bar, engines that
 * anchor a fixed panel to its ancestor instead of the viewport would leave the
 * panel at the top of the document, i.e. off-screen once the page is scrolled.
 */
const Menu: React.FC<MenuProps> = ({
	children,
	className,
	menuId,
	onOpen,
	onClose,
}) => {
	const generatedId = useId();
	const finalMenuId = menuId || `menu-${generatedId}`;
	const menuRef = useRef<HTMLMenuElement>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const popover = menuRef.current;
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
	}, [onOpen, onClose, mounted]);

	if (!mounted) return null;

	return createPortal(
		<menu
			ref={menuRef}
			id={finalMenuId}
			popover="auto"
			role="menu"
			className={className}
		>
			{children}
		</menu>,
		document.body,
	);
};

export default Menu;
