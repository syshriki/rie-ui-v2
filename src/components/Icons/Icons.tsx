import type React from "react";

type IconProps = (
	| { size: number | string; className?: string }
	| { size?: number | string; className: string }
);

export const CloseIcon: React.FC<IconProps> = ({ size, className }) => (
	<svg
		{...(size != null ? { width: size, height: size } : {})}
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

export const EditIcon: React.FC<IconProps> = ({ size, className }) => (
	<svg
		{...(size != null ? { width: size, height: size } : {})}
		viewBox="2 0 18 24"
		fill="currentColor"
		className={className}
	>
		<path d="M4.3367 16.071L3.94269 19.6888C3.9081 20.0064 4.17624 20.2746 4.49389 20.24L8.11161 19.846C8.45133 19.809 8.76823 19.6571 9.00986 19.4154L20.0011 8.42417C20.5869 7.83838 20.5869 6.88863 20.0011 6.30285L17.8798 4.18153C17.294 3.59574 16.3443 3.59574 15.7585 4.18153L4.76722 15.1728C4.52559 15.4144 4.3737 15.7313 4.3367 16.071ZM18.9405 3.12087L21.0618 5.24219C22.2334 6.41376 22.2334 8.31325 21.0618 9.48483L10.0705 20.4761C9.58725 20.9594 8.95345 21.2631 8.27401 21.3371L4.65629 21.7311C3.38571 21.8695 2.31313 20.7969 2.45151 19.5264L2.84552 15.9086C2.91952 15.2292 3.22329 14.5954 3.70656 14.1121L14.6978 3.12087C15.8694 1.94929 17.7689 1.94929 18.9405 3.12087Z" />
		<path d="M20.0011 6.30285L17.8798 4.18153C17.294 3.59574 16.3443 3.59574 15.7585 4.18153L14.4857 5.45432L18.7283 9.69696L20.0011 8.42417C20.5869 7.83838 20.5869 6.88863 20.0011 6.30285ZM18.7283 11.8183L12.3644 5.45432L14.6978 3.12087C15.8694 1.94929 17.7689 1.94929 18.9405 3.12087L21.0618 5.24219C22.2334 6.41376 22.2334 8.31326 21.0618 9.48483L18.7283 11.8183Z" />
	</svg>
);

export const DeleteIcon: React.FC<IconProps> = ({ size, className }) => (
	<svg
		{...(size != null ? { width: size, height: size } : {})}
		viewBox="0 0 1024 1024"
		fill="currentColor"
		className={className}
	>
		<path d="M160 256H96a32 32 0 010-64h256V95.936a32 32 0 0132-32h256a32 32 0 0132 32V192h256a32 32 0 110 64h-64v672a32 32 0 01-32 32H192a32 32 0 01-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 01-32-32V416a32 32 0 0164 0v320a32 32 0 01-32 32zm192 0a32 32 0 01-32-32V416a32 32 0 0164 0v320a32 32 0 01-32 32z" />
	</svg>
);

export const PrintIcon: React.FC<IconProps> = ({ size, className }) => (
	<svg
		{...(size != null ? { width: size, height: size } : {})}
		viewBox="0 0 32 32"
		fill="currentColor"
		className={className}
	>
		<path d="M30 14.25h-3.25V6a.75.75 0 00-.22-.53l-4-4a.75.75 0 00-.53-.22H5a.75.75 0 00-.75.75v12.25H2.25a.75.75 0 00-.75.75v9a.75.75 0 001.5 0v-8.25h26.5v8.25a.75.75 0 001.5 0v-9a.75.75 0 00-.75-.75zM5.75 2.75h15.94l3.56 3.561v7.939h-19.5zM26 21.25H6a.75.75 0 00-.75.75v8a.75.75 0 00.75.75h20a.75.75 0 00.75-.75v-8a.75.75 0 00-.75-.75zm-.75 8h-18.5v-6.5h18.5z" />
	</svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size, className }) => (
	<svg
		{...(size != null ? { width: size, height: size } : {})}
		viewBox="0 0 18 18"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M3 8l3 5 9-11" />
	</svg>
);
