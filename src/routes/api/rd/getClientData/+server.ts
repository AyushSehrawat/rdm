import { PUBLIC_BASE_URI, PUBLIC_BASE_AUTH_URI, PUBLIC_CLIENT_ID } from '$env/static/public';

export const GET = async ({ url, request, cookies, fetch }) => {
	const deviceCode = url.searchParams.get('deviceCode') ?? '';
	console.log(deviceCode);	

	try {
		const res = await fetch(
			`${PUBLIC_BASE_AUTH_URI}/oauth/v2/device/credentials?client_id=${PUBLIC_CLIENT_ID}&code=${deviceCode}`
		);
		const data = await res.json();
		console.log(data);
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
