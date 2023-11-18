import type { APIResponse, AccessTokenResponse } from '$lib/app/types';

export const POST = async ({ cookies, fetch }) => {
	const clientId: string | undefined = cookies.get('clientId');
	const clientSecret: string | undefined = cookies.get('clientSecret');
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

		const data: APIResponse<AccessTokenResponse> = await res.json();

		if (data.success) {
			cookies.set('accessToken', data?.data ? data.data.access_token : '', {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				maxAge: data.expires_in
			});

			return new Response(JSON.stringify({ success: true, status: 200 } as APIResponse), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		}

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
