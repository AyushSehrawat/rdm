import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	let clientId = cookies.get('clientId');
	return {
		clientId: clientId
	};
};
