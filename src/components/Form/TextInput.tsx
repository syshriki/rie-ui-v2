"use client";
import clsx from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import styles from "./form.module.css";
import { useFieldControl } from "./useFieldControl";

type TextInputProps = ComponentPropsWithoutRef<"input">;

/** Single-line text control, styled to match `TextArea` on every screen size. */
const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
	({ className, ...props }, ref) => {
		const control = useFieldControl(props);

		return (
			<input
				ref={ref}
				{...props}
				{...control}
				className={clsx(styles.control, className)}
			/>
		);
	},
);

TextInput.displayName = "TextInput";

export default TextInput;
