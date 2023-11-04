import { PUBLIC_BASE_URI } from '$env/static/public';

export const GET = async ({ url, request, cookies, fetch, params }) => {
	const id = params.id;
	const accessToken = cookies.get('accessToken') ?? '';
	const refreshToken = cookies.get('refreshToken') ?? '';

	try {
		if (refreshToken === '') {
			return new Response(JSON.stringify({ error: 'No access token or refresh token' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
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
		}

		const token = cookies.get('accessToken') ?? '';

		const res = await fetch(`${PUBLIC_BASE_URI}/torrents/info/${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});

		const data = await res.json();
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error?.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};