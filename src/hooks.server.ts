import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect, error } from '@sveltejs/kit';

const protectRoutes: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/app') || event.url.pathname.startsWith('/api/app')) {
		let refreshToken = event.cookies.get('refreshToken') ?? '';
		if (refreshToken === '') {
			throw redirect(303, '/');
		}
	}

	return resolve(event);
};

export const handle = sequence(protectRoutes);
