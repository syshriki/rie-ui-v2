import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		//We do this to ensure that the container scrolls to the top when new content is loaded.
		if (contentRef.current) {
			contentRef.current.scrollTo({ top: 0 });
		}
	}, [searchParams]); // Triggers on path or query changes (e.g., ?page=2)

	const contentRef = useRef<HTMLDivElement>(null);

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
			</Paper>
		</Paper>
	);
}
