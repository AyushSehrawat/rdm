import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const clientId: string | undefined = cookies.get('clientId');
	return {
		clientId: clientId
	};
};
