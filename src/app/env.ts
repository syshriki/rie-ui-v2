import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {},
	client: {
		NEXT_PUBLIC_BASE_URL: z.url(),
		NEXT_PUBLIC_API_BASE_URL: z.url(),
		NEXT_PUBLIC_REDDIT_AUTH_URL: z.url(),
		NEXT_PUBLIC_FB_AUTH_URL: z
			.union([z.url(), z.literal("")])
			.optional()
			.default(""),
		NEXT_PUBLIC_MOCK_MODE: z
			.enum(["true", "false"])
			.optional()
			.default("false"),
		NEXT_PUBLIC_MOCK_DELAY: z
			.string()
			.optional()
			.default("0"),
	},
	runtimeEnv: {
		NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
		NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
		NEXT_PUBLIC_REDDIT_AUTH_URL: process.env.NEXT_PUBLIC_REDDIT_AUTH_URL,
		NEXT_PUBLIC_FB_AUTH_URL: process.env.NEXT_PUBLIC_FB_AUTH_URL,
		NEXT_PUBLIC_MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE,
		NEXT_PUBLIC_MOCK_DELAY: process.env.NEXT_PUBLIC_MOCK_DELAY,
	},
});
