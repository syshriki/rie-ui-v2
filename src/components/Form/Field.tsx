"use client";
import clsx from "clsx";
import { createContext, useContext, useId, type ReactNode } from "react";
import ErrorText from "../ErrorText/ErrorText";
import styles from "./form.module.css";

/**
 * Wiring a `Field` shares with the control rendered inside it: the id used by
 * `<label htmlFor>`, and the aria attributes that announce errors.
 */
interface FieldContextValue {
	id: string;
	errorId: string;
	invalid: boolean;
	required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Reads the surrounding `Field`. `TextInput` and `TextArea` call this so pages
 * never have to wire up ids, `aria-invalid` or `aria-describedby` by hand.
 */
export function useField(): FieldContextValue | null {
	return useContext(FieldContext);
}

interface FieldProps {
	label: string;
	/** Shows the required marker and marks the control as required. */
	required?: boolean;
	/** Shows the "(optional)" hint next to the label. */
	optional?: boolean;
	/** Validation message, rendered underneath the control. */
	error?: string;
	/** Overrides the generated control id. */
	id?: string;
	className?: string;
	children: ReactNode;
}

/**
 * One labelled form row: label + control + validation message.
 */
const Field = ({
	label,
	required = false,
	optional = false,
	error,
	id,
	className,
	children,
}: FieldProps) => {
	const generatedId = useId();
	const fieldId = id ?? generatedId;
	const errorId = `${fieldId}-error`;

	return (
		<FieldContext.Provider
			value={{ id: fieldId, errorId, invalid: Boolean(error), required }}
		>
			<div className={clsx(styles.field, className)}>
				<FieldLabel id={fieldId} required={required} optional={optional}>
					{label}
				</FieldLabel>
				{children}
				{error ? (
					<ErrorText id={errorId} className={styles.error}>
						{error}
					</ErrorText>
				) : null}
			</div>
		</FieldContext.Provider>
	);
};

interface FieldLabelProps {
	id: string;
	required: boolean;
	optional: boolean;
	children: ReactNode;
}

const FieldLabel = ({ id, required, optional, children }: FieldLabelProps) => (
	<label htmlFor={id} className={styles.label}>
		{children}
		{required ? (
			<>
				<span className={styles.required} aria-hidden="true">
					*
				</span>
				<span className={styles.srOnly}> (required)</span>
			</>
		) : null}
		{optional ? <span className={styles.optional}>(optional)</span> : null}
	</label>
);

export default Field;
