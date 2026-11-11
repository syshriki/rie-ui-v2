"use client";
import { useField } from "./Field";

interface FieldControlOptions {
	id?: string;
	required?: boolean;
}

/**
 * The id + aria wiring a control inherits from the `Field` it sits in, so each
 * control component stays a thin wrapper around the native element.
 */
export function useFieldControl({ id, required }: FieldControlOptions) {
	const field = useField();
	const isRequired = required ?? field?.required ?? false;
	const isInvalid = field?.invalid ?? false;

	return {
		id: id ?? field?.id,
		required: isRequired,
		"aria-required": isRequired || undefined,
		"aria-invalid": isInvalid || undefined,
		"aria-describedby": isInvalid ? field?.errorId : undefined,
	};
}
