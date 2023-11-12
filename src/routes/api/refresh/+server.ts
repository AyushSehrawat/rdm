export const POST = async ({ cookies, fetch }) => {
	const clientId = cookies.get('clientId') ?? '';
	const clientSecret = cookies.get('clientSecret') ?? '';
	const refreshToken = cookies.get('refreshToken') ?? '';

	if (refreshToken === '') {
		return new Response(JSON.stringify({ error: 'No access token or refresh token' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const res = await fetch('/api/rd/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				clientId: clientId,
				clientSecret: clientSecret,
				code: refreshToken
			})
		});

		const data = await res.json();

		if ('access_token' in data) {
			cookies.set('accessToken', data.access_token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				maxAge: data.expires_in
			});
		} else {
			return new Response(JSON.stringify({ error: 'No access token or refresh token' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

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
