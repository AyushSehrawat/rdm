import { PUBLIC_BASE_AUTH_URI, PUBLIC_CLIENT_ID } from '$env/static/public';

export const GET = async ({ fetch }) => {
	try {
		const res = await fetch(
			`${PUBLIC_BASE_AUTH_URI}/oauth/v2/device/code?client_id=${PUBLIC_CLIENT_ID}&new_credentials=yes`
		);
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
