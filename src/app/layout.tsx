import type { Metadata } from "next";
import "../api/setup";
import "./globals.css";

export const metadata: Metadata = {
	title: "Rie.recipes",
	description: "A collection of delicious recipes",
	icons: {
		icon: "/favicon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
