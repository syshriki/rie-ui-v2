"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type React from "react";
import { useRef, useState } from "react";
import Menu from "../../Menu/Menu";
import styles from "./footer.module.css";

interface FooterProps {
	selected?: "profile" | "recipes" | "news" | "add" | "logout";
	className?: string;
	isLoggedIn: boolean;
}

const Footer: React.FC<FooterProps> = ({ selected, className, isLoggedIn }) => {
	const popoverRef = useRef<HTMLDivElement>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
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
		<footer className={`${className} ${styles.footer}`}>
			<nav>
				<Link href="/recipes" style={{ all: "unset" }}>
					<div
						className={clsx(styles.clickable, {
							[styles.selected]: selected === "recipes",
						})}
					>
						<img src="/recipe.svg" aria-label="Recipes" />
					</div>
				</Link>
				{isLoggedIn ? (
					<Link href="/add" style={{ all: "unset" }}>
						<div
							className={clsx(styles.clickable, {
								[styles.selected]: selected === "add",
							})}
						>
							<img src="/add.svg" aria-label="Add" />
						</div>
					</Link>
				) : (
					<div className={clsx(styles.clickable, styles.disabled)}>
						<img src="/add.svg" aria-label="Add" />
					</div>
				)}
				<div className={clsx(styles.clickable, styles.disabled)}>
					<img src="/news.svg" aria-label="News" />
				</div>

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
					>
						<img src="/hamburger.svg" aria-label="Show More" />
					</button>
				</div>

				<Menu
					ref={popoverRef}
					menuId={menuId}
					onOpen={() => setIsMenuOpen(true)}
					onClose={() => setIsMenuOpen(false)}
				>
					<div className={clsx(styles.clickable, styles.disabled)}>
						<img src="/profile.svg" aria-label="Profile" />
						<span>Profile</span>
					</div>
					{isLoggedIn ? (
						<button
							className={clsx(styles.clickable)}
							onClick={() => {
								window.location.href = "/logout";
							}}
							type="button"
							style={{ all: "unset", width: "100%" }}
						>
							<img src="/logout.svg" aria-label="Logout" />
							<span>Logout</span>
						</button>
					) : (
						<button
							className={clsx(styles.clickable)}
							onClick={() => {
								window.location.href = `/login?redirectUri=${redirectPath}`;
							}}
							type="button"
							style={{ all: "unset", width: "100%" }}
						>
							<img src="/login.svg" aria-label="Login" />
							<span>Login</span>
						</button>
					)}
				</Menu>
			</nav>
		</footer>
	);
};

export default Footer;
