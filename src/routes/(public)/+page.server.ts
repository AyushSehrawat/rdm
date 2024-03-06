import type { PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
    // client_id because this cookie requires 'lax' SameSite attribute, refer to login endpoint for more info
	const clientId: string | undefined = cookies.get('client_id');

	return {
		clientId: clientId
	};
}) satisfies PageServerLoad;
