import { PUBLIC_BASE_URI } from '$env/static/public';
import type { APIResponse, TorrentInfoResponse } from '$lib/app/types';

export const GET = async ({ cookies, fetch, params }) => {
	const id: string = params.id;
	let accessToken: string | undefined = cookies.get('accessToken');
	const refreshToken: string | undefined = cookies.get('refreshToken');

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

		const res = await fetch(`${PUBLIC_BASE_URI}/torrents/info/${id}`, {
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
			} as APIResponse<TorrentInfoResponse>),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: error }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};

export const DELETE = async ({ cookies, fetch, params }) => {
	const id: string = params.id;
	let accessToken: string | undefined = cookies.get('accessToken');
	const refreshToken: string | undefined = cookies.get('refreshToken');

	try {
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

		const res = await fetch(`${PUBLIC_BASE_URI}/torrents/delete/${id}`, {
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
						message: `Deleted torrent ${id}`
					} as APIResponse),
					{
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			case 401:
			case 403:
				return new Response(
					JSON.stringify({
						success: false,
						status: 401,
						error: 'Bad token or permission denied'
					} as APIResponse),
					{
						status: 401,
						headers: { 'Content-Type': 'application/json' }
					}
				);

			case 404:
				return new Response(
					JSON.stringify({
						success: false,
						status: 404,
						error: 'Torrent not found'
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
						status: 500,
						error: 'Unknown error'
					} as APIResponse),
					{
						status: 500,
						headers: { 'Content-Type': 'application/json' }
					}
				);
		}
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
