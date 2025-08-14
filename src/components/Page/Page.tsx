import Header from "./Header/Header";
import styles from "./page.module.css";
import Sidebar from "./Sidebar/Sidebar";
import type { SidebarProps } from "./Sidebar/Sidebar";
import Paper from "../Paper/Paper";
import Corner from "./Corner/Corner";
import MobileFooter from "./Footer/Footer";

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
	return (
		<Paper className={styles.container}>
			<div className={styles.left}>
				<Corner />
				<Sidebar
					className={styles.sidebar}
					selected={selected}
					isLoggedIn={isLoggedIn}
				/>
			</div>
			<div className={styles.scrollableContainer}>
				<div>
					<Paper>
						<Header>{headerText}</Header>
						<main>{children}</main>
					</Paper>
				</div>
			</div>
			<MobileFooter
				className={styles.footer}
				selected={selected}
				isLoggedIn={isLoggedIn}
			/>
		</Paper>
	);
}
