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
	},
	runtimeEnv: {
		NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
		NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
		NEXT_PUBLIC_REDDIT_AUTH_URL: process.env.NEXT_PUBLIC_REDDIT_AUTH_URL,
		NEXT_PUBLIC_FB_AUTH_URL: process.env.NEXT_PUBLIC_FB_AUTH_URL,
	},
});
