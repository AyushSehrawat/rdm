import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const clientId = cookies.get('clientId');
	return {
		clientId: clientId
	};
};
