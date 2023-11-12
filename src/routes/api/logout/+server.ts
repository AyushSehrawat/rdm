export const GET = async ({ cookies }) => {
	try {
		cookies.set('accessToken', '', {
			path: '/',
			expires: new Date(0)
		});
		cookies.set('refreshToken', '', {
			path: '/',
			expires: new Date(0)
		});
		cookies.set('clientId', '', {
			path: '/',
			expires: new Date(0)
		});
		cookies.set('clientSecret', '', {
			path: '/',
			expires: new Date(0)
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
