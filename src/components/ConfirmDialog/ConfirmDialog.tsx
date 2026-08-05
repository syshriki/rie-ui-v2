"use client";
import type React from "react";
import Button from "../Button/Button";
import Dialog from "../Dialog/Dialog";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	children?: React.ReactNode;
	cancelText?: string;
	confirmText?: string;
	onCancel: () => void;
	onConfirm: () => void;
	isConfirming?: boolean;
	confirmingText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	isOpen,
	title,
	children,
	cancelText = "Cancel",
	confirmText = "OK",
	onCancel,
	onConfirm,
	isConfirming = false,
	confirmingText,
}) => (
	<Dialog isOpen={isOpen}>
		<div className={styles.confirmDialog}>
			<p>
				<strong>{title}</strong>
			</p>
			{children}
			<nav className={styles.controls}>
				<Button
					size="medium"
					variant="secondary"
					disabled={isConfirming}
					onClick={onCancel}
				>
					{cancelText}
				</Button>
				<Button
					size="medium"
					disabled={isConfirming}
					onClick={onConfirm}
				>
					{isConfirming ? confirmingText : confirmText}
				</Button>
			</nav>
		</div>
	</Dialog>
);

export default ConfirmDialog;
