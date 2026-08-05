import "./src/app/env";

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	output: "standalone",
	outputFileTracingRoot: path.join(__dirname),
	transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
	turbopack: {
		// In production (or any build without NEXT_PUBLIC_MOCK_MODE=true),
		// alias the mock provider to a no-op so zero MSW code reaches the bundle.
		resolveAlias:
			process.env.NEXT_PUBLIC_MOCK_MODE !== "true"
				? {
						// Relative import from src/app/MockGate.tsx
						"../mocks/MswProvider":
							"./src/app/NoopMswProvider.tsx",
					}
				: {},
	},
};

export default nextConfig;
