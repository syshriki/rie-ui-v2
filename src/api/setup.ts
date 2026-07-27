// SDK client interceptors and global error handling.
// Import this file once at app startup (e.g. in layout.tsx) to configure
// the generated client before any API calls are made.

import { client } from './sdk/client.gen';

client.setConfig({
  baseUrl: process.env.NEXT_API_URL
});

// Global error handling: redirect to /error on 404 or 500+ responses,
// matching the legacy failOnNonOk behaviour.
client.interceptors.response.use(async (response) => {
	if (typeof window !== 'undefined' && (response.status === 404 || response.status >= 500)) {
		window.location.href = '/error';
	}
	return response;
});
