"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import "../../api/setup";
import Paper from "../Paper/Paper";
import Corner from "./Corner/Corner";
import Header from "./Header/Header";
import MobilTopBar from "./MobileTopBar/MobileTopBar";
import Sidebar from "./Sidebar/Sidebar";
import type { SidebarProps } from "./Sidebar/Sidebar";
import styles from "./page.module.css";

export default function PageLayout({
	children,
	headerText,
	selected,
	isLoggedIn = false,
}: Readonly<{
	children: React.ReactNode;
	headerText: React.ReactNode;
	selected?: SidebarProps["selected"];
	isLoggedIn?: boolean;
}>) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const contentRef = useRef<HTMLDivElement>(null);

	// Scroll to the top whenever the route changes.
	// biome-ignore lint/correctness/useExhaustiveDependencies: contentRef is a stable ref
	useLayoutEffect(() => {
		contentRef.current?.scrollTo({ top: 0, behavior: "instant" });
	}, [pathname, searchParams]);

	return (
		<Paper className={styles.container}>
			<MobilTopBar
				className={styles.mobileTopBar}
				selected={selected}
				isLoggedIn={isLoggedIn}
			/>
			<div className={styles.left}>
				<Corner className={styles.corner} />
				<Sidebar
					className={styles.sidebar}
					selected={selected}
					isLoggedIn={isLoggedIn}
				/>
			</div>
			<Paper className={styles.scrollableContainer} ref={contentRef}>
				<Header>{headerText}</Header>
				<main>{children}</main>
				<footer className={styles.footer} />
			</Paper>
		</Paper>
	);
}
