import type { APIResponse } from '$lib/app/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	let accessToken: string | undefined = cookies.get('accessToken');
	const refreshToken: string | undefined = cookies.get('refreshToken');

	try {
		if (!refreshToken) {
			return {};
		}

		if (!accessToken) {
			const res = await fetch('/api/refresh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const data: APIResponse = await res.json();
			if (!data.success) {
				return new Response(
					JSON.stringify({
						success: false,
						status: 401,
						error: 'No access token or refresh token'
					} as APIResponse),
					{
						status: 401,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			}

			accessToken = cookies.get('accessToken') ?? '';
			return { accessToken: accessToken };
		} else {
			return { accessToken: accessToken };
		}
	} catch (error) {
		return {};
	}
};
