"use client";
import clsx from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import styles from "./form.module.css";
import { useFieldControl } from "./useFieldControl";

interface TextAreaProps extends ComponentPropsWithoutRef<"textarea"> {
	/** `large` is for the main body of a form (e.g. the recipe itself). */
	size?: "default" | "large";
}

/** Multi-line text control, resizable vertically on every screen size. */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
	({ className, size = "default", ...props }, ref) => {
		const control = useFieldControl(props);

		return (
			<textarea
				ref={ref}
				{...props}
				{...control}
				className={clsx(
					styles.control,
					size === "large" ? styles.textAreaLarge : styles.textArea,
					className,
				)}
			/>
		);
	},
);

TextArea.displayName = "TextArea";

export default TextArea;
