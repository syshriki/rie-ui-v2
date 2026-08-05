'use client';

import { env } from '@/env';
import { client } from './sdk/client.gen';
import { refresh } from './auth';

client.setConfig({ baseUrl: env.NEXT_PUBLIC_API_BASE_URL });

client.interceptors.response.use(async (response, request, opts) => {
	if (response.status === 401 && request) {
		try {
			const refreshResponse = await refresh();
			window.localStorage.setItem(
				'expiresAt',
				new Date(refreshResponse.expiresAt).toString(),
			);
			const _fetch = opts.fetch!;
			const retryResponse = await _fetch(request.clone());
			if (retryResponse.status !== 401) {
				return retryResponse;
			}
			window.location.href = '/error';
			return response;
		} catch {
			window.location.href = '/login';
			return response;
		}
	}

	if (response.status === 404 || response.status >= 500) {
		window.location.href = '/error';
	}

	return response;
});

export { client as apiClient };
