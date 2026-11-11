"use client";
import clsx from "clsx";
import type React from "react";
import Card from "../Card/Card";
import styles from "./form.module.css";

interface FormProps extends React.ComponentProps<"form"> {
	/** Action buttons, rendered in the form's bordered footer row. */
	footer?: React.ReactNode;
}

/**
 * The default form surface: a Paper-styled card holding labelled fields and an
 * optional footer of actions. Pages only provide the fields and the footer.
 */
const Form = ({ footer, children, className, ...props }: FormProps) => (
	<Card className={styles.card}>
		<form noValidate className={clsx(styles.form, className)} {...props}>
			<div className={styles.fields}>{children}</div>
			{footer ? <div className={styles.footer}>{footer}</div> : null}
		</form>
	</Card>
);

export default Form;
