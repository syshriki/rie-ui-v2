"use client";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useState } from "react";
import Menu from "../../Menu/Menu";
import MenuItem from "../../Menu/MenuItem/MenuItem";
import styles from "./mobileTopBar.module.css";

interface FooterProps {
	selected?: "profile" | "recipes" | "news" | "add" | "logout";
	className?: string;
	isLoggedIn: boolean;
}

const Footer: React.FC<FooterProps> = ({ selected, className, isLoggedIn }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const router = useRouter();
	const menuId = "footer-menu";
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Extract just the path portion without domain
	const currentPath = pathname || "";
	const queryString = searchParams?.toString();
	const redirectPath = queryString
		? `${currentPath}?${queryString}`
		: currentPath;

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
					popoverTarget={menuId}
					popoverTargetAction="show"
					id="footer-menu-trigger"
				>
					<img src="/hamburger.svg" aria-label="Show Menu" />
				</button>
			</div>

			<Menu
				menuId={menuId}
				className={styles.menu}
				noRadiusCorner="topLeft"
				onOpen={() => setIsMenuOpen(true)}
				onClose={() => setIsMenuOpen(false)}
				anchorToElement="footer-menu-trigger"
			>
				<MenuItem
					onClick={() => {
						router.push("/recipes");
					}}
				>
					<div className={selected === "recipes" ? styles.selectedItem : ""}>
						<img src="/recipe.svg" aria-label="Recipes" />
						<span>Recipes</span>
					</div>
				</MenuItem>
				{isLoggedIn ? (
					<MenuItem
						onClick={() => {
							router.push("/add");
						}}
					>
						<div className={selected === "add" ? styles.selectedItem : ""}>
							<img src="/add.svg" aria-label="Add" />
							<span>Add</span>
						</div>
					</MenuItem>
				) : (
					<MenuItem disabled>
						<img src="/add.svg" aria-label="Add" />
						<span>Add</span>
					</MenuItem>
				)}
				<MenuItem disabled>
					<img src="/news.svg" aria-label="News" />
					<span>News</span>
				</MenuItem>
				<MenuItem disabled>
					<img src="/profile.svg" aria-label="Profile" />
					<span>Profile</span>
				</MenuItem>
				{isLoggedIn ? (
					<MenuItem
						onClick={() => {
							router.push("/logout");
						}}
					>
						<img src="/logout.svg" aria-label="Logout" />
						<span>Logout</span>
					</MenuItem>
				) : (
					<MenuItem
						onClick={() => {
							router.push(`/login?redirectUri=${redirectPath}`);
						}}
					>
						<img src="/login.svg" aria-label="Login" />
						<span>Login</span>
					</MenuItem>
				)}
			</Menu>
			<img className={styles.logo} src="/rie.svg" aria-label="Rie Logo" />
		</nav>
	);
};

export default Footer;
