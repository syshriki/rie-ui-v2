import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import Login from "@/pages/login";
import { BrowserRouter, Route, Routes } from "react-router";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Login />} />
				<Route path="/login" element={<Login />} />
			</Routes>
		</BrowserRouter>
		,
	</StrictMode>,
);
