import { PUBLIC_BASE_AUTH_URI } from '$env/static/public';
import type { APIResponse } from '$lib/app/types';

interface RequestBody {
	clientId: string;
	clientSecret: string;
	code: string;
}

export const POST = async ({ request, fetch }) => {
	const body: RequestBody = await request.json();
	const clientId: string = body.clientId ?? '';
	const clientSecret: string = body.clientSecret ?? '';
	const code: string = body.code ?? '';

	try {
		const res = await fetch(`${PUBLIC_BASE_AUTH_URI}/oauth/v2/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: `grant_type=http://oauth.net/grant_type/device/1.0&client_id=${clientId}&client_secret=${clientSecret}&code=${code}`
		});
		const data = await res.json();

		if (!res.ok) {
			return new Response(
				JSON.stringify({
					status: res.status,
					success: false,
					error: data.error_description
				} as APIResponse),
				{
					status: res.status,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		return new Response(
			JSON.stringify({
				status: 200,
				success: true,
				data: data
			} as APIResponse),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: error } as APIResponse), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
