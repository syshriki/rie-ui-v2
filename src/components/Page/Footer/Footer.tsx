"use client";
import type React from "react";
import clsx from "clsx";
import styles from "./footer.module.css";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface FooterProps {
	selected?: "profile" | "recipes" | "news" | "add" | "logout";
	className?: string;
	isLoggedIn: boolean;
}

const Footer: React.FC<FooterProps> = ({ selected, className, isLoggedIn }) => {
	const popoverRef = useRef<HTMLDivElement>(null);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Extract just the path portion without domain
	const currentPath = pathname || "";
	const queryString = searchParams?.toString();
	const redirectPath = queryString
		? `${currentPath}?${queryString}`
		: currentPath;

	useEffect(() => {
		const popover = popoverRef.current;
		if (!popover) return;
		const handleToggle = (event: Event) => {
			const toggleEvent = event as ToggleEvent;
			if (toggleEvent.newState === "open") {
				setIsPopoverOpen(true);
			} else {
				setIsPopoverOpen(false);
			}
		};
		popover.addEventListener("toggle", handleToggle);
		return () => {
			popover.removeEventListener("toggle", handleToggle);
		};
	}, []);

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
						[styles.selected]: isPopoverOpen,
					})}
				>
					<button
						type="button"
						style={{ all: "unset" }}
						popoverTarget={styles.hamburger}
						popoverTargetAction="show"
					>
						<img src="/hamburger.svg" aria-label="Show More" />
					</button>
				</div>
			</nav>
			<menu id={styles.hamburger} popover="auto" role="menu" ref={popoverRef}>
				<div className={styles.hamburgerContent}>
					<div className={clsx(styles.clickable, styles.disabled)}>
						<img src="/profile.svg" aria-label="Profile" />
						<span>Profile</span>
					</div>
					{isLoggedIn ? (
						<div
							className={clsx(styles.clickable)}
							onClick={() => {
								window.location.href = "/logout";
							}}
						>
							<img src="/logout.svg" aria-label="Logout" />
							<span>Logout</span>
						</div>
					) : (
						<div
							className={clsx(styles.clickable)}
							onClick={() => {
								window.location.href = `/login?redirectUri=${redirectPath}`;
							}}
						>
							<img src="/login.svg" aria-label="Login" />
							<span>Login</span>
						</div>
					)}
				</div>
			</menu>
		</footer>
	);
};

export default Footer;
