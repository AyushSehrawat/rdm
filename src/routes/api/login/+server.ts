import type { RequestHandler } from './$types';

type RequestBody = {
	accessToken: string;
	refreshToken: string;
	clientId: string;
	clientSecret: string;
	expiresIn: number;
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body: RequestBody = await request.json();

	try {
		const accessToken: string = body.accessToken ?? '';
		const refreshToken: string = body.refreshToken ?? '';
		const clientId: string = body.clientId ?? '';
		const clientSecret: string = body.clientSecret ?? '';
		const expiresIn: number = body.expiresIn ?? 0;

		cookies.set('access_token', accessToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: expiresIn
		});

		cookies.set('refresh_token', refreshToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 31536000
		});

		// Lax to fix the bug of showing not logged in when coming from external website
		/*
		https://owasp.org/www-community/SameSite
		The lax value provides a reasonable balance between security and usability for websites 
		that want to maintain user’s logged-in session after the user arrives from an external link.
		In the above GitHub scenario, the session cookie would be allowed when following a regular 
		link from an external website while blocking it in CSRF-prone request methods (e.g. POST).
		*/
		cookies.set('client_id', clientId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 31536000
		});

		cookies.set('client_secret', clientSecret, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 31536000
		});

		return new Response(JSON.stringify({ success: true, status: 200 }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, status: 500, error: error }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
