import type React from "react";

interface IconProps {
	size?: number;
	className?: string;
}

export const CloseIcon: React.FC<IconProps> = ({ size = 18, className }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 18 18"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		className={className}
	>
		<path d="M3 3l12 12M15 3L3 15" />
	</svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 18, className }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 18 18"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M4 9l3.5 3.5L14 5" />
	</svg>
);
