import { PUBLIC_BASE_URI } from '$env/static/public';
import type { APIResponse, AccessTokenResponse, UserResponse } from '$lib/app/types';

export const GET = async ({ cookies, fetch }) => {
	try {
		let accessToken: string | undefined = cookies.get('accessToken');
		const refreshToken: string | undefined = cookies.get('refreshToken');

		if (!refreshToken) {
			return new Response(
				JSON.stringify({
					success: false,
					status: 401,
					error: 'No access token or refresh token'
				} as APIResponse),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		if (!accessToken) {
			const res = await fetch('/api/refresh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const data: APIResponse<AccessTokenResponse> = await res.json();

			if (!data.success) {
				return new Response(
					JSON.stringify({
						status: 401,
						success: false,
						error: 'No access token or refresh token'
					} as APIResponse),
					{
						status: 401,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			}

			accessToken = cookies.get('accessToken');
		}

		const res = await fetch(`${PUBLIC_BASE_URI}/user`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			}
		});

		const data = await res.json();
		return new Response(
			JSON.stringify({
				status: 200,
				success: true,
				data: data
			} as APIResponse<UserResponse>),
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
