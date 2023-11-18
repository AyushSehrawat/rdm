import { PUBLIC_BASE_URI } from '$env/static/public';
import type { APIResponse } from '$lib/app/types';

export const DELETE = async ({ cookies, fetch, params }) => {
	const id: string = params.id;
	let accessToken: string | undefined = cookies.get('accessToken');
	const refreshToken: string | undefined = cookies.get('refreshToken');
	console.log(`Deleting download ${id}`);

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

			const data: APIResponse = await res.json();

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

		const res = await fetch(`${PUBLIC_BASE_URI}/downloads/delete/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			}
		});

		switch (res.status) {
			case 204:
				return new Response(
					JSON.stringify({
						success: true,
						status: res.status,
						message: `Deleted download ${id}`
					} as APIResponse),
					{
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			case 401:
				return new Response(
					JSON.stringify({
						success: false,
						status: res.status,
						error: 'Bad token (expired, invalid)'
					} as APIResponse),
					{
						status: 401,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			case 403:
				return new Response(
					JSON.stringify({
						success: false,
						status: res.status,
						error: 'Forbidden! Account locked'
					} as APIResponse),
					{
						status: 403,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			case 404:
				return new Response(
					JSON.stringify({
						success: false,
						status: res.status,
						error: 'Download not found'
					} as APIResponse),
					{
						status: 404,
						headers: { 'Content-Type': 'application/json' }
					}
				);

			default:
				return new Response(
					JSON.stringify({
						success: false,
						status: res.status,
						error: 'Unknown error'
					} as APIResponse),
					{
						status: 500,
						headers: { 'Content-Type': 'application/json' }
					}
				);
		}
	} catch (error) {
		console.log(error);
		return new Response(
			JSON.stringify({ status: 500, success: false, error: error } as APIResponse),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
