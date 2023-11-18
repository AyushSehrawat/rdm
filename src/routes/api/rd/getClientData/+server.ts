import { PUBLIC_BASE_AUTH_URI, PUBLIC_CLIENT_ID } from '$env/static/public';
import type { APIResponse } from '$lib/app/types';

export const GET = async ({ url, fetch }) => {
	const deviceCode: string | null = url.searchParams.get('deviceCode');

	if (!deviceCode) {
		return new Response(
			JSON.stringify({
				status: 400,
				success: false,
				error: 'Missing device code'
			} as APIResponse),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	try {
		const res = await fetch(
			`${PUBLIC_BASE_AUTH_URI}/oauth/v2/device/credentials?client_id=${PUBLIC_CLIENT_ID}&code=${deviceCode}`
		);
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
		return new Response(
			JSON.stringify({ success: false, status: 500, error: error } as APIResponse),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
