"use client";

import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { revoke } from "../../api/auth";
import Paper from "../../components/Paper/Paper";
import { useIsLoggedIn } from "../../hooks/auth";
import Chefy from "./chefy";
import styles from "./login.module.css";

function generateState(redirectUri = "recipes") {
	const state = {
		redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback?redirectUri=${redirectUri}`,
		nonce: Math.random().toString(36).substring(2, 15),
	};

	const stateJson = JSON.stringify(state);

	return btoa(stateJson);
}

// Client component that uses useSearchParams
function LoginClient() {
	const { isLoggedIn, isLoading } = useIsLoggedIn({});
	const searchParams = useSearchParams();
	const redirectUri = searchParams.get("redirectUri") ?? undefined;
	const router = useRouter();

	useEffect(() => {
		if (isLoggedIn) {
			router.push(redirectUri || "/recipes");
		}
	}, [isLoggedIn, redirectUri, router]);

	if (isLoading) {
		return null;
	}

	return (
		<div className={styles.container}>
			<Paper className={styles.left}>
				<div className={styles.content}>
					<div className={styles.header}>
						<h1>Rie.recipes</h1>
					</div>
					<div className={styles.body}>
						<Chefy />
					</div>
					<div className={styles.footer}>
						<h2>Meet Your Inner Chef</h2>
						<img src="underline_crayon.svg" alt="crayon underline" />
					</div>
				</div>
			</Paper>
			<div className={styles.center} />
			<div className={styles.right}>
				<div className={styles.content}>
					<div className={styles.header}>
						<img src="shelf_long.png" alt="vegi shelf header" />
					</div>
					<div>
						<h1 className={styles.primaryHeading}>Welcome</h1>
						<h1 className={styles.secondaryHeading}>Rie.recipes</h1>
						<p className={styles.subHeader}>
							Choose an option below to get started
						</p>
						<div className={styles.buttonContainer}>
							<button
								type="button"
								disabled
								tabIndex={-1}
								className={styles.button}
							>
								<img src="/google.png" alt="Google logo" />
								Continue With Google
							</button>
							<button
								type="button"
								tabIndex={0}
								className={styles.button}
								onClick={() =>
									router.push(
										`${process.env.NEXT_PUBLIC_FB_AUTH_URL}&state=${generateState(redirectUri)}`,
									)
								}
							>
								<img src="/fb.png" alt="Facebook logo" />
								Continue With Facebook
							</button>
							<button
								type="button"
								tabIndex={0}
								className={styles.button}
								onClick={() =>
									router.push(
										`${process.env.NEXT_PUBLIC_REDDIT_AUTH_URL}&state=${generateState(redirectUri)}`,
									)
								}
							>
								<img src="/reddit.png" alt="Reddit logo" />
								Continue With Reddit
							</button>
							<button
								type="button"
								disabled
								tabIndex={-1}
								className={styles.button}
							>
								<img src="/yahoo.png" alt="Yahoo logo" />
								Continue With Yahoo
							</button>

							<div className={styles.anonymousButtonContainer}>
								<button
									type="button"
									tabIndex={0}
									className={clsx(styles.button, styles.anonymousButton)}
									onClick={async () => {
										// incase bad credentials are stored (it will automatically clear them instead of trying to refresh)
										await revoke().finally(() => {
											router.push(redirectUri ?? "/recipes");
										});
									}}
								>
									<img src="/anonymous.svg" alt="Anonymous login" />
									Continue Anonymously
								</button>
							
							</div>
								<div className={styles.links}>
									<a href="/privacy">
									Privacy Policy
									</a>
									<a href="/terms">
											Terms of Service
									</a>
								</div>
						</div>
					</div>
					<div className={styles.footer}>
						<img src="/pancakes.png" alt="pile of pancakes footer" />
					</div>
				</div>
			</div>
		</div>
	);
}

// Main page component with Suspense boundary
export default function Login() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LoginClient />
		</Suspense>
	);
}
