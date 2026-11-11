"use client";
import clsx from "clsx";
import type React from "react";
import CardRule from "../Card/CardRule";
import PageCard from "../Page/PageCard/PageCard";
import styles from "./form.module.css";

interface FormProps extends React.ComponentProps<"form"> {
	/** Action buttons, rendered in the form's bordered footer row. */
	footer?: React.ReactNode;
}

/**
 * The default form surface: a page card holding labelled fields and an optional
 * footer of actions, closed off by a rule that spans the card. Pages only
 * provide the fields and the footer.
 */
const Form = ({ footer, children, className, ...props }: FormProps) => (
	<PageCard padding="none" className={styles.card}>
		<form noValidate className={clsx(styles.form, className)} {...props}>
			<div className={styles.fields}>{children}</div>
			{footer ? <CardRule className={styles.footer}>{footer}</CardRule> : null}
		</form>
	</PageCard>
);

export default Form;
