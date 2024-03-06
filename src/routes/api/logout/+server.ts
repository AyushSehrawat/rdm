import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	try {
		cookies.set('client_id', '', {
			path: '/',
			expires: new Date(0)
		});

		cookies.set('client_secret', '', {
			path: '/',
			expires: new Date(0)
		});

		cookies.set('access_token', '', {
			path: '/',
			expires: new Date(0)
		});

		cookies.set('refresh_token', '', {
			path: '/',
			expires: new Date(0)
		});

		return new Response(JSON.stringify({ success: true, status: 200 }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error(`[logout] Error logging out: ${error}`);

		return new Response(JSON.stringify({ success: false, status: 500 }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return new Response();
};
