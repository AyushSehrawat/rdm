import type { PageLoad } from './$types';

export const load = (async ({ data }) => {
	const isLoggedIn: boolean = data.clientId ? true : false;

	return {
		isLoggedIn: isLoggedIn
	};
}) satisfies PageLoad;
