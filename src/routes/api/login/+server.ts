export const POST = async ({ request, cookies }) => {
	const body = await request.json();

	try {
		const accessToken = body.accessToken ?? '';
		const refreshToken = body.refreshToken ?? '';
		const clientId = body.clientId ?? '';
		const clientSecret = body.clientSecret ?? '';
		const expiresIn = body.expiresIn ?? '';
		// const expiresAt = body.expiresAt ?? '';

		cookies.set('accessToken', accessToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: expiresIn
		});

		cookies.set('refreshToken', refreshToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 31536000
		});

		cookies.set('clientId', clientId, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 31536000
		});

		cookies.set('clientSecret', clientSecret, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 31536000
		});

		return new Response(JSON.stringify({ success: 'true' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
