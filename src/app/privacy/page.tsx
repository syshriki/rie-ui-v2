"use client";

import { Suspense } from "react";
import Card from "../../components/Card/Card";
import Page from "../../components/Page/Page";
import styles from "./page.module.css";

function PrivacyContent() {
	return (
		<Page headerText="Privacy Policy">
			<div className={styles.container}>
				<Card className={styles.card}>
					<p>
						<strong>Last updated:</strong> July 27, 2026
					</p>
					<p>
						Rie.recipes is operated by{" "}
						<strong>SY&S Consulting</strong>, which is the data
						controller responsible for your personal information.
					</p>

					<h3>1. Information We Collect</h3>
					<p>
						When you sign in, we collect the following information from
						your authentication provider:
					</p>
					<ul>
						<li>
							<strong>Facebook Login:</strong> your first name and email
							address
						</li>
						<li>
							<strong>Reddit Login:</strong> your Reddit username
						</li>
					</ul>
					<p>
						We also collect a unique user identifier assigned by our
						authentication system. We do not collect your passwords,
						friend lists, or any other profile data beyond what is listed
						above.
					</p>
					<p>
						When you use the site, we also collect:
					</p>
					<ul>
						<li>
							<strong>Recipe content you create:</strong> when you submit a
							recipe, we store the title, description, recipe text, and
							ingredients you provide. This content is linked to your account
							and displayed publicly on the site.
						</li>
						<li>
							<strong>Favorited recipes:</strong> when you favorite a recipe,
							we store a record linking your account to that recipe, along
							with a timestamp. This allows us to show you your favorited
							recipes and display favorite counts on your profile.
						</li>
					</ul>

					<h3>2. How We Use Your Information</h3>
					<p>We use the information we collect to:</p>
					<ul>
						<li>Create and manage your account on Rie.recipes</li>
						<li>Personalize your experience (e.g., displaying your name)</li>
						<li>
							Associate recipes and content you create with your account
						</li>
						<li>
							Save and track your favorited recipes
						</li>
						<li>Communicate with you about your account if needed</li>
					</ul>
					<p>
						We do not sell, rent, or share your personal information with
						third parties for their own marketing purposes.
					</p>

					<h3>3. Authentication & Third-Party Services</h3>
					<p>
						Rie.recipes uses Facebook Login and Reddit Login as
						authentication providers. When you sign in, your chosen
						provider processes your login and shares only the information
						described in Section 1 with us.
					</p>
					<p>
						<strong>Facebook Login:</strong> your use of Facebook Login is
						also governed by Facebook&apos;s{" "}
						<a
							href="https://www.facebook.com/privacy/policy/"
							target="_blank"
							rel="noopener noreferrer"
						>
							Privacy Policy
						</a>{" "}
						and{" "}
						<a
							href="https://www.facebook.com/terms.php"
							target="_blank"
							rel="noopener noreferrer"
						>
							Terms of Service
						</a>
						.
					</p>
					<p>
						<strong>Reddit Login:</strong> your use of Reddit Login is also
						governed by Reddit&apos;s{" "}
						<a
							href="https://www.reddit.com/policies/privacy-policy"
							target="_blank"
							rel="noopener noreferrer"
						>
							Privacy Policy
						</a>{" "}
						and{" "}
						<a
							href="https://www.redditinc.com/policies/user-agreement"
							target="_blank"
							rel="noopener noreferrer"
						>
							User Agreement
						</a>
						.
					</p>

					<h3>4. Data Storage & Security</h3>
					<p>
						Your authentication token and user identifier are stored in
						your browser&apos;s local storage. We use secure, HTTP-only
						cookies for session management. We take reasonable measures to
						protect your personal information, but no method of
						transmission over the Internet is 100% secure.
					</p>

					<h3>5. Your Rights</h3>
					<p>You have the right to:</p>
					<ul>
						<li>
							Access the personal data we hold about you (your name or
							username, email if provided, and account identifier) on
							your{" "}
							<a href="/profile">Profile page</a>
						</li>
						<li>
							Delete your account and all associated data (including all
							recipes you have created and all favorited recipes) at any
							time from your{" "}
							<a href="/profile">Profile page</a>
						</li>
						<li>
							Use the site anonymously without providing any personal
							information via the &quot;Continue Anonymously&quot; option
						</li>
					</ul>
					<p>
						<strong>Account deletion is irreversible.</strong> When you
						delete your account, all of your personal data is permanently
						removed, including your profile information, all recipes you
						have created, and all favorited recipes. This action cannot
						be undone. You can delete your account directly from your{" "}
						<a href="/profile">Profile page</a>. For other requests
						regarding your data, please contact us using the information
						below. When you log out, your session data is cleared from
						your browser.
					</p>

					<h3>6. Cookies & Local Storage</h3>
					<p>
						We use browser local storage to persist your authentication
						state (user ID and session expiry). We use HTTP-only cookies
						for secure session tokens. We do not use tracking cookies or
						third-party analytics cookies.
					</p>

					<h3>7. Children&apos;s Privacy</h3>
					<p>
						Rie.recipes is not directed to children under the age of 13.
						We do not knowingly collect personal information from children
						under 13. If you believe a child has provided us with personal
						information, please contact us so we can delete it.
					</p>

					<h3>8. Changes to This Policy</h3>
					<p>
						We may update this Privacy Policy from time to time. Any
						changes will be posted on this page with an updated effective
						date. Your continued use of Rie.recipes after changes are
						posted constitutes your acceptance of the updated policy.
					</p>

					<h3>9. Contact Us</h3>
					<p>
						If you have any questions about this Privacy Policy or wish
						to exercise your data rights, please contact us at:
					</p>
					<p>
						<strong>SY&S Consulting</strong>
					</p>
					<p>
						Email:{" "}
						<a href="mailto:shlomo@rie.recipes">shlomo@rie.recipes</a>
					</p>
					<p style={{ marginTop: "var(--space-xl)" }}>
						See also:{" "}
						<a href="/terms">Terms of Service</a>
					</p>
				</Card>
			</div>
		</Page>
	);
}

export default function PrivacyPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<PrivacyContent />
		</Suspense>
	);
}
