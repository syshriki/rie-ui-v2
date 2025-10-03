"use client";

import { Suspense } from "react";
import Card from "../../components/Card/Card";
import Page from "../../components/Page/Page";
import styles from "./page.module.css";

//TODO: add error icon here
function ErrorContent() {
	return (
		<Page headerText="An error occurred">
			<div className={styles.container}>
				<Card className={styles.card}>
					<p>Something went wrong. Please try again later.</p>
				</Card>
			</div>
		</Page>
	);
}

export default function ErrorPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ErrorContent />
		</Suspense>
	);
}
