"use client";
import type React from "react";
import clsx from "clsx";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export interface SidebarProps {
	selected?: "profile" | "recipes" | "news" | "add" | "logout";
	className?: string;
	isLoggedIn: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
	selected,
	className,
	isLoggedIn,
}) => {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Extract just the path portion without domain
	const currentPath = pathname || "";
	const queryString = searchParams?.toString();
	const redirectPath = queryString
		? `${currentPath}?${queryString}`
		: currentPath;

	return (
		<nav className={`${styles.sidebar} ${className}`}>
			<nav>
				<ul>
					<li>
						<Link href="/recipes" style={{ all: "unset" }}>
							<div
								className={clsx(styles.clickable, {
									[styles.selected]: selected === "recipes",
								})}
								title="Recipes"
							>
								<img src="/recipe.svg" aria-label="Recipes" />
								<span>Recipes</span>
							</div>
						</Link>
					</li>
					<li>
						<div
							className={clsx(styles.clickable, styles.disabled)}
							title="News"
						>
							<img src="/news.svg" aria-label="News" />
							<span>News</span>
						</div>
					</li>
					<li>
						{isLoggedIn ? (
							<Link href="/add" style={{ all: "unset" }}>
								<div
									title="Add Recipe"
									className={clsx(styles.clickable, {
										[styles.selected]: selected === "add",
									})}
								>
									<img src="/add.svg" aria-label="Add" />
									<span>Add</span>
								</div>
							</Link>
						) : (
							<div
								title="Add Recipe"
								className={clsx(styles.clickable, styles.disabled)}
							>
								<img src="/add.svg" aria-label="Add" />
								<span>Add</span>
							</div>
						)}
					</li>
					<li>
						<div
							className={clsx(styles.clickable, styles.disabled)}
							title="View My Profile"
						>
							<img src="/profile.svg" aria-label="Profile" />
							<span>Profile</span>
						</div>
					</li>
				</ul>
			</nav>
			<footer>
				{isLoggedIn ? (
					<Link href="/logout" style={{ all: "unset" }}>
						<div
							title="Logout"
							className={`${styles.footer} ${styles.clickable}`}
						>
							<img src="/logout.svg" aria-label="Logout" />
							<span>Logout</span>
						</div>
					</Link>
				) : (
					<Link
						href={{
							pathname: "/login",
							query: { redirectUri: redirectPath },
						}}
						style={{ all: "unset" }}
					>
						<div
							title="Login"
							className={`${styles.footer} ${styles.clickable}`}
						>
							<img src="/login.svg" aria-label="Login" />
							<span>Login</span>
						</div>
					</Link>
				)}
			</footer>
		</nav>
	);
};

export default Sidebar;
