import type { APIResponse } from '$lib/app/types';

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

		return new Response(JSON.stringify({ success: true, status: 200 } as APIResponse), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(
			JSON.stringify({ status: 200, success: false, error: error } as APIResponse),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
