import type { PageLoad } from './$types';
import { getDeviceCode } from '$lib/rd';

export const load = (async ({ fetch }) => {
	try {
		const response = await getDeviceCode(fetch);
		return response;
	} catch (error) {
		return {
			status: 500,
			error: error
		};
	}
}) satisfies PageLoad;
