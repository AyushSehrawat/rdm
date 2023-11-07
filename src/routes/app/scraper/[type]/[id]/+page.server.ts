import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	let accessToken = cookies.get('accessToken') ?? '';
	const refreshToken = cookies.get('refreshToken') ?? '';

	try {
		if (refreshToken === '') {
			return {};
		}

		if (accessToken === '') {
			let res = await fetch('/api/refresh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let data = await res.json();
			if (data.hasOwnProperty('error')) {
				return new Response(JSON.stringify({ error: 'No access token or refresh token' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				});
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
