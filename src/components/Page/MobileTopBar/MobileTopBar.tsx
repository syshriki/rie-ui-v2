"use client";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useState } from "react";
import Menu from "../../Menu/Menu";
import MenuItem from "../../Menu/MenuItem/MenuItem";
import { CloseIcon } from "../../Icons/Icons";
import styles from "./mobileTopBar.module.css";

type Section = "profile" | "recipes" | "news" | "add" | "logout";

interface FooterProps {
	selected?: Section;
	className?: string;
	isLoggedIn: boolean;
}

const MENU_ID = "footer-menu";
const MENU_TRIGGER_ID = "footer-menu-trigger";

/** Close button + logo, so the full-screen menu still reads as the app. */
const MenuHeader: React.FC = () => (
	<div className={styles.menuHeader}>
		<button
			type="button"
			className={styles.closeButton}
			aria-label="Close Menu"
			popoverTarget={MENU_ID}
			popoverTargetAction="hide"
		>
			<CloseIcon className={styles.closeIcon} />
		</button>
		<img className={styles.logo} src="/rie.svg" aria-label="Rie Logo" />
	</div>
);

/** An entry the app knows about but has not shipped yet. */
const DisabledItem: React.FC<{ icon: string; label: string }> = ({
	icon,
	label,
}) => (
	<MenuItem disabled>
		<img src={icon} aria-label={label} />
		<span>{label}</span>
	</MenuItem>
);

const Footer: React.FC<FooterProps> = ({ selected, className, isLoggedIn }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Extract just the path portion without domain
	const currentPath = pathname || "";
	const queryString = searchParams?.toString();
	const redirectPath = queryString
		? `${currentPath}?${queryString}`
		: currentPath;

	const navItem = (
		section: Section,
		icon: string,
		label: string,
		onClick: () => void,
	) => (
		<MenuItem selected={selected === section} onClick={onClick}>
			<img src={icon} aria-label={label} />
			<span>{label}</span>
		</MenuItem>
	);

	return (
		<nav className={clsx(className, styles.mobileTopBar)}>
			<div
				className={clsx(styles.clickable, {
					[styles.selected]: isMenuOpen,
				})}
			>
				<button
					type="button"
					style={{ all: "unset" }}
					popoverTarget={MENU_ID}
					popoverTargetAction="show"
					id={MENU_TRIGGER_ID}
				>
					<img src="/hamburger.svg" aria-label="Show Menu" />
				</button>
			</div>

			<Menu
				menuId={MENU_ID}
				className={styles.menu}
				onOpen={() => setIsMenuOpen(true)}
				onClose={() => setIsMenuOpen(false)}
			>
				<MenuHeader />

				<div className={styles.items}>
					{navItem("recipes", "/recipe.svg", "Recipes", () =>
						router.push("/recipes"),
					)}

					{isLoggedIn ? (
						navItem("add", "/add.svg", "Add", () => router.push("/add"))
					) : (
						<DisabledItem icon="/add.svg" label="Add" />
					)}

					<DisabledItem icon="/news.svg" label="News" />

					{isLoggedIn ? (
						navItem("profile", "/profile.svg", "Profile", () =>
							router.push("/profile"),
						)
					) : (
						<DisabledItem icon="/profile.svg" label="Profile" />
					)}
				</div>

				<div className={styles.account}>
					{isLoggedIn ? (
						<MenuItem
							selected={selected === "logout"}
							onClick={() => router.push("/logout")}
						>
							<img src="/logout.svg" aria-label="Logout" />
							<span>Logout</span>
						</MenuItem>
					) : (
						<MenuItem
							onClick={() =>
								router.push(`/login?redirectUri=${redirectPath}`)
							}
						>
							<img src="/login.svg" aria-label="Login" />
							<span>Login</span>
						</MenuItem>
					)}
				</div>
			</Menu>

			<img className={styles.logo} src="/rie.svg" aria-label="Rie Logo" />
		</nav>
	);
};

export default Footer;
