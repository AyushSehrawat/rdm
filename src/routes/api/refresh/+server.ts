import type { RequestHandler } from './$types';
import { getAccessToken } from '$lib/rd';

export const GET: RequestHandler = async ({ cookies, fetch }) => {
	const clientId = cookies.get('client_id');
	const clientSecret = cookies.get('client_secret');
	const refreshToken = cookies.get('refresh_token');

	if (!clientId || !clientSecret || !refreshToken) {
		return new Response(JSON.stringify({ success: false, status: 401 }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const data = await getAccessToken(fetch, clientId, clientSecret, refreshToken);

		cookies.set('access_token', data.access_token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: data.expires_in
		});
	} catch (error) {
		throw error;
	}

	return new Response(JSON.stringify({ success: true, status: 200 }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
