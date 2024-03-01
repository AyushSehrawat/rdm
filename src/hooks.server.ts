import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';

const protectRoutes: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/app') || event.url.pathname.startsWith('/api/app')) {
		const clientId = event.cookies.get('client_id');
        const accessToken = event.cookies.get('access_token');
        
		if (!clientId) {
			throw redirect(303, '/');
		} else if (!accessToken) {
            const data = await event.fetch('/api/refresh');
        }
	}

	return resolve(event);
};

export const handle = sequence(protectRoutes);
