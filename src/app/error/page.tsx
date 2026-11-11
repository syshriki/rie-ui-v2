"use client";

import { Suspense } from "react";
import Page from "../../components/Page/Page";
import PageCard from "../../components/Page/PageCard/PageCard";
import styles from "./page.module.css";

//TODO: add error icon here
function ErrorContent() {
	return (
		<Page headerText="An error occurred">
			<PageCard className={styles.card}>
				<p>Something went wrong. Please try again later.</p>
			</PageCard>
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
