import "./src/app/env";

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	output: "standalone",
	outputFileTracingRoot: path.join(__dirname),
	transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
};

export default nextConfig;
