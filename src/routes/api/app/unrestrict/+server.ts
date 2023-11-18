import { PUBLIC_BASE_URI } from '$env/static/public';
import type { APIResponse, UnrestrictResponse } from '$lib/app/types';
interface RequestBody {
	link: string;
}

export const POST = async ({ request, cookies, fetch }) => {
	const body: RequestBody = await request.json();
	let accessToken: string | undefined = cookies.get('accessToken');
	const refreshToken: string | undefined = cookies.get('refreshToken');
	const link: string = body.link;
	console.log(link);

	try {
		if (!refreshToken) {
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

		if (!accessToken) {
			const res = await fetch('/api/refresh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const data = await res.json();
			if (!data.success) {
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

			accessToken = cookies.get('accessToken');
		}

		const res = await fetch(`${PUBLIC_BASE_URI}/unrestrict/link`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: `link=${link}&password=`
		});

		const data = await res.json();

		if (!res.ok) {
			return new Response(
				JSON.stringify({
					status: res.status,
					success: false,
					error: data.error
				} as APIResponse),
				{
					status: res.status,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		return new Response(
			JSON.stringify({
				status: res.status,
				success: true,
				data: data
			} as APIResponse<UnrestrictResponse>),
			{
				status: res.status,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify({ status: 500, success: false, error: error } as APIResponse),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
