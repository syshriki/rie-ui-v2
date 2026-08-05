"use client";

import { Suspense } from "react";
import Card from "../../components/Card/Card";
import Page from "../../components/Page/Page";
import styles from "../privacy/page.module.css";

function TermsContent() {
	return (
		<Page headerText="Terms of Service">
			<div className={styles.container}>
				<Card className={styles.card}>
					<p>
						<strong>Last updated:</strong> July 27, 2026
					</p>
					<p>
						These Terms of Service govern your use of Rie.recipes,
						operated by <strong>SY&S Consulting</strong>.
					</p>

					<h3>1. Acceptance of Terms</h3>
					<p>
						By accessing or using Rie.recipes, you agree to be bound by
						these Terms of Service. If you do not agree, please do not
						use the site.
					</p>

					<h3>2. Description of Service</h3>
					<p>
						Rie.recipes is a platform for sharing and discovering
						recipes. Users can create, view, and favorite recipes. The
						service is provided &quot;as is&quot; and may change or be
						discontinued at any time.
					</p>

					<h3>3. User Accounts</h3>
					<p>
						To access certain features, you may sign in using Facebook
						Login, Reddit Login, or continue anonymously. You are
						responsible for maintaining the confidentiality of your
						account and for all activities under your account.
					</p>

					<h3>4. User Content</h3>
					<p>
						When you submit recipes or other content to Rie.recipes:
					</p>
					<ul>
						<li>
							You retain ownership of your content, but grant us a
							worldwide, non-exclusive, royalty-free license to display
							and distribute it on the site.
						</li>
						<li>
							You are solely responsible for the content you submit and
							represent that you have all necessary rights to do so.
						</li>
						<li>
							We reserve the right to remove any content that violates
							these terms or is otherwise objectionable.
						</li>
					</ul>

					<h3>5. Acceptable Use</h3>
					<p>You agree not to:</p>
					<ul>
						<li>
							Post content that is unlawful, harmful, harassing,
							defamatory, or otherwise objectionable
						</li>
						<li>
							Impersonate any person or entity, or misrepresent your
							affiliation with any person or entity
						</li>
						<li>
							Use the site in any way that could damage, disable, or
							impair the service
						</li>
						<li>
							Attempt to gain unauthorized access to any part of the
							service
						</li>
					</ul>

					<h3>6. Intellectual Property</h3>
					<p>
						The Rie.recipes name, logo, and site design are the property
						of SY&S Consulting. Recipe content belongs to their respective
						authors. You may not copy, modify, or distribute any part of
						the site without permission, except for recipe content you
						have created.
					</p>

					<h3>7. Termination</h3>
					<p>
						We may suspend or terminate your access to Rie.recipes at any
						time, without notice, for conduct that we believe violates
						these terms or is harmful to other users, us, or third
						parties. You may delete your account at any time from your{" "}
						<a href="/profile">Profile page</a>.
					</p>

					<h3>8. Disclaimer of Warranties</h3>
					<p>
						Rie.recipes is provided on an &quot;as is&quot; and &quot;as
						available&quot; basis. We make no warranties, express or
						implied, regarding the accuracy, reliability, or availability
						of the service. Your use of the site is at your own risk.
					</p>

					<h3>9. Limitation of Liability</h3>
					<p>
						To the fullest extent permitted by law, SY&S Consulting shall
						not be liable for any indirect, incidental, special, or
						consequential damages arising from your use of Rie.recipes,
						including but not limited to loss of data or content.
					</p>

					<h3>10. Changes to These Terms</h3>
					<p>
						We may update these Terms of Service from time to time.
						Continued use of the site after changes are posted constitutes
						your acceptance of the updated terms. If you do not agree to
						the changes, you should stop using the site.
					</p>

					<h3>11. Contact</h3>
					<p>
						If you have any questions about these Terms of Service,
						please contact us at:
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
						<a href="/privacy">Privacy Policy</a>
					</p>
				</Card>
			</div>
		</Page>
	);
}

export default function TermsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<TermsContent />
		</Suspense>
	);
}
