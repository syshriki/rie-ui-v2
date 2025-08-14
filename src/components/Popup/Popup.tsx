"use client";
import type React from "react";
import { useRef, useEffect } from "react";
import styles from "./popup.module.css";

interface PopupProps {
	children?: React.ReactNode;
	isOpen: boolean;
}
const Popover: React.FC<PopupProps> = ({ children, isOpen }) => {
	const popoverRef = useRef<HTMLDialogElement>(null);
	console.log({ isOpen });
	useEffect(() => {
		if (isOpen) {
			popoverRef.current?.showModal();
			console.log("Popover opened");
		} else {
			popoverRef.current?.close();
			console.log("Popover closed");
		}
	}, [isOpen]);
	return (
		<dialog ref={popoverRef} className={styles.dialog}>
			{children}
		</dialog>
	);
};

export default Popover;
