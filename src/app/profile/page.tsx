"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { deleteUser, getMe, updateUser } from "../../api/sdk";
import type { UserProfile } from "../../api/sdk";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import Dialog from "../../components/Dialog/Dialog";
import Page from "../../components/Page/Page";
import { CheckIcon, CloseIcon } from "../../components/Icons/Icons";
import ErrorText from "../../components/ErrorText/ErrorText";
import Spinner from "../../components/Spinner/Spinner";
import { useIsLoggedIn } from "../../hooks/auth";
import styles from "./page.module.css";

function getInitials(username: string): string {
	return username.slice(0, 2).toUpperCase();
}

function ProfileContent() {
	const { isLoggedIn, isLoading: authLoading, logout, userId } =
		useIsLoggedIn();
	const router = useRouter();

	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const [isEditingUsername, setIsEditingUsername] = useState(false);
	const [newUsername, setNewUsername] = useState("");
	const [isSavingUsername, setIsSavingUsername] = useState(false);

	useEffect(() => {
		if (!authLoading && !isLoggedIn) {
			router.push("/login?redirectUri=/profile");
			return;
		}

		if (!authLoading && isLoggedIn) {
			getMe().then((result) => {
				if (result.error) {
					setError("Failed to load profile. Please try again later.");
				} else {
					setProfile(result.data as UserProfile);
				}
				setIsLoading(false);
			});
		}
	}, [isLoggedIn, authLoading, router]);

	const handleDelete = async () => {
		if (!userId) return;
		setIsDeleting(true);
		setError(null);

		const result = await deleteUser({ path: { id: userId } });

		if (result.error) {
			setError("Failed to delete account. Please try again later.");
			setIsDeleting(false);
			setIsDeleteOpen(false);
		} else {
			setIsDeleting(false);
			setIsDeleteOpen(false);
			logout("/login");
		}
	};

	const handleEditUsername = () => {
		setError(null);
		setNewUsername(profile?.username ?? "");
		setIsEditingUsername(true);
	};

	const handleCancelEdit = () => {
		setIsEditingUsername(false);
		setNewUsername("");
	};

	const handleSaveUsername = async () => {
		if (!newUsername.trim()) {
			setError("Username cannot be empty.");
			return;
		}
		if (newUsername.trim() === profile?.username) {
			setIsEditingUsername(false);
			return;
		}

		setIsSavingUsername(true);
		setError(null);

		const result = await updateUser({
			body: { username: newUsername.trim() },
		});

		if (result.error) {
			setError("Failed to update username. Please try again later.");
			setIsSavingUsername(false);
		} else {
			window.location.reload();
		}
	};

	const showLoading = authLoading || isLoading;

	return (
		<Page
			headerText="My Profile"
			isLoggedIn={isLoggedIn}
			selected="profile"
		>
			<div className={styles.container}>
				<Card className={styles.card}>
					{showLoading && <p>Loading...</p>}

					{error && <ErrorText>{error}</ErrorText>}

					{!showLoading && profile && (
						<>
							<div className={styles.profileHeader}>
								<div className={styles.avatar}>
									{getInitials(profile.username)}
								</div>
								{isEditingUsername ? (
								<div className={styles.editRow}>
									<input
										className={styles.editInput}
										type="text"
										value={newUsername}
										onChange={(e) =>
											setNewUsername(e.target.value)
										}
										maxLength={30}
									/>
									<div className={styles.icons}>
										<button
											type="button"
											className={styles.editAction}
											disabled={isSavingUsername}
											onClick={handleCancelEdit}
											aria-label="Cancel editing"
										>
											<CloseIcon size={18} />
										</button>
										<button
											type="button"
											className={styles.editAction}
											disabled={isSavingUsername}
											onClick={handleSaveUsername}
											aria-label="Save username"
										>
											{isSavingUsername ? (
												<Spinner size={16} />
											) : (
												<CheckIcon size={18} />
											)}
										</button>
									</div>
								</div>
							) : (
								<div className={styles.usernameRow}>
									<h2 className={styles.username}>
										{profile.username}
									</h2>
									<button
										type="button"
										className={styles.editButton}
										onClick={handleEditUsername}
										aria-label="Edit username"
									>
										✎
									</button>
								</div>
							)}
								<p className={styles.memberSince}>
									Member since{" "}
									{new Date(
										profile.createdAt
									).toLocaleDateString()}
								</p>
							</div>

							<div className={styles.stats}>
								<div className={styles.stat}>
									<span className={styles.statNumber}>
										{profile.recipeCount}
									</span>
									<span className={styles.statLabel}>
										Recipes
									</span>
								</div>
								<div className={styles.stat}>
									<span className={styles.statNumber}>
										{profile.favoriteCount}
									</span>
									<span className={styles.statLabel}>
										Favorites
									</span>
								</div>
							</div>

							<div className={styles.dangerZone}>
								<Button
									size="medium"
									variant="secondary"
									onClick={() => setIsDeleteOpen(true)}
								>
									Delete My Account
								</Button>
							</div>
						</>
					)}
				</Card>
			</div>

			<Dialog isOpen={isDeleteOpen}>
				<div className={styles.deleteDialog}>
					<p>
						<strong>
							Are you sure you want to delete your account?
						</strong>
					</p>
					<p>
						This will permanently remove all your recipes,
						favorites, and account data. This action cannot be
						undone.
					</p>
					<nav className={styles.deleteControls}>
						<Button
							size="medium"
							variant="secondary"
							disabled={isDeleting}
							onClick={() => setIsDeleteOpen(false)}
						>
							Cancel
						</Button>
						<Button
							size="medium"
							disabled={isDeleting}
							onClick={handleDelete}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</nav>
				</div>
			</Dialog>
		</Page>
	);
}

export default function ProfilePage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ProfileContent />
		</Suspense>
	);
}
