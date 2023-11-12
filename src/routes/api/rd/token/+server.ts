import { PUBLIC_BASE_AUTH_URI } from '$env/static/public';

export const POST = async ({ request, fetch }) => {
	const body = await request.json();
	const clientId = body.clientId ?? '';
	const clientSecret = body.clientSecret ?? '';
	const code = body.code ?? '';

	try {
		const res = await fetch(`${PUBLIC_BASE_AUTH_URI}/oauth/v2/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: `grant_type=http://oauth.net/grant_type/device/1.0&client_id=${clientId}&client_secret=${clientSecret}&code=${code}`
		});
		const data = await res.json();
		return new Response(JSON.stringify(data), {
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
