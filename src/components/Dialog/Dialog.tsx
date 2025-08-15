"use client";
import type React from "react";
import { useEffect, useRef } from "react";
import styles from "./dialog.module.css";

interface DialogProps {
	children?: React.ReactNode;
	isOpen: boolean;
}
const Dialog: React.FC<DialogProps> = ({ children, isOpen }) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		if (isOpen) {
			dialogRef.current?.showModal();
		} else {
			dialogRef.current?.close();
		}
	}, [isOpen]);
	return (
		<dialog ref={dialogRef} className={styles.dialog}>
			{children}
		</dialog>
	);
};

export default Dialog;
