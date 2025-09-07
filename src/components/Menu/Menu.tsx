"use client";
import clsx from "clsx";
import { type ReactNode, useEffect, useId, useRef } from "react";

type NoRadiusCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

interface MenuProps {
	children: ReactNode;
	className?: string;
	menuId?: string;
	onOpen?: () => void;
	onClose?: () => void;
	noRadiusCorner?: NoRadiusCorner;
	anchorToElement?: string; // ID of the element to anchor the menu to
}

const Menu: React.FC<MenuProps> = ({
	children,
	className,
	menuId,
	onOpen,
	onClose,
	noRadiusCorner = "bottomRight", // Set default to bottomRight to match the CSS
	anchorToElement,
}) => {
	const generatedId = useId();
	const finalMenuId = menuId || `menu-${generatedId}`;
	const menuRef = useRef<HTMLMenuElement>(null);

	useEffect(() => {
		// This will run after the first render when the DOM is ready
		const popover = menuRef.current;

		// Safety check
		if (!popover) return;

		const handleToggle = (event: Event) => {
			const toggleEvent = event as ToggleEvent;
			if (toggleEvent.newState === "open") {
				onOpen?.();

				// Position the menu relative to the anchor element if provided
				if (anchorToElement && popover) {
					const anchorEl = document.getElementById(anchorToElement);
					if (anchorEl) {
						const anchoElRect = anchorEl.getBoundingClientRect();
						const popoverElRect = popover.getBoundingClientRect();
						// Position at the bottom right corner of the anchor element
						popover.style.position = "fixed";
						if (
							noRadiusCorner === "bottomRight" ||
							noRadiusCorner === "bottomLeft"
						) {
							popover.style.top = `${anchoElRect.y - popoverElRect.height - 16}px`; // 5 to add a small gap
						} else {
							popover.style.top = `${anchoElRect.y + anchoElRect.height + 16}px`;
						}

						if (
							noRadiusCorner === "bottomRight" ||
							noRadiusCorner === "topRight"
						) {
							popover.style.right = `${window.innerWidth - anchoElRect.right + 0.5 * anchoElRect.width}px`;
						} else {
							popover.style.right = `${window.innerWidth + anchoElRect.right - 0.5 * anchoElRect.width}px`;
						}
						popover.style.left = "auto"; // Reset left to avoid conflicts
						popover.style.margin = "0";
					}
				}
			} else {
				onClose?.();
			}
		};

		popover.addEventListener("toggle", handleToggle);
		return () => {
			popover.removeEventListener("toggle", handleToggle);
		};
	}, [onOpen, onClose, anchorToElement, noRadiusCorner]);

	return (
		<menu
			ref={menuRef}
			id={finalMenuId}
			popover="auto"
			role="menu"
			className={clsx(className)}
			data-no-radius-corner={noRadiusCorner}
		>
			{children}
		</menu>
	);
};

export default Menu;
