import { PUBLIC_BASE_URI } from '$env/static/public';
import type { AddMagnetResponse, APIResponse } from '$lib/app/types';

interface RequestBody {
	hash: string;
	selectedFilesId: number[];
}

export const POST = async ({ fetch, cookies, request }) => {
	let accessToken: string | undefined = cookies.get('accessToken');
	const refreshToken: string | undefined = cookies.get('refreshToken');
	const body: RequestBody = await request.json();
	const hash = body?.hash;
	const selectedFilesId = body?.selectedFilesId;

	try {
		if (!refreshToken) {
			return new Response(
				JSON.stringify({
					status: 401,
					success: false,
					error: 'Unauthorized. No access token or refresh token.'
				} as APIResponse),
				{
					status: 401,
					headers: {
						'content-type': 'application/json'
					}
				}
			);
		}

		if (!hash) {
			return new Response(
				JSON.stringify({
					status: 400,
					success: false,
					error: 'Bad Request. No hash provided'
				} as APIResponse),
				{
					status: 400,
					headers: {
						'content-type': 'application/json'
					}
				}
			);
		}

		if (!selectedFilesId) {
			return new Response(
				JSON.stringify({
					status: 400,
					success: false,
					error: 'Bad Request. No selectedFilesId provided'
				} as APIResponse),
				{
					status: 400,
					headers: {
						'content-type': 'application/json'
					}
				}
			);
		}

		if (!accessToken) {
			let res = await fetch('/api/refresh', {
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

		console.log(`Reinserting torrent ${hash}`);

		const magnetRes = await fetch(`${PUBLIC_BASE_URI}/torrents/addMagnet`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Bearer ${accessToken}`
			},
			body: `magnet=magnet:?xt=urn:btih:${hash}&host=`
		});

		if (magnetRes.status !== 201) {
			return new Response(
				JSON.stringify({
					success: false,
					status: magnetRes.status,
					error: 'Bad Request. Could not add magnet'
				} as APIResponse),
				{
					status: 400,
					headers: {
						'content-type': 'application/json'
					}
				}
			);
		}

		const magnetData: AddMagnetResponse = await magnetRes.json();

		const torrentRes = await fetch(`${PUBLIC_BASE_URI}/torrents/selectFiles/${magnetData.id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: `files=${selectedFilesId.join(',')}`
		});

		switch (torrentRes.status) {
			case 204:
				return new Response(
					JSON.stringify({
						status: 204,
						success: true,
						message: 'Torrent reinserted',
						id: magnetData.id
					} as APIResponse),
					{
						status: 200,
						headers: {
							'content-type': 'application/json'
						}
					}
				);

			case 202:
				return new Response(
					JSON.stringify({
						status: 202,
						success: true,
						message: 'Torrent already added',
						id: magnetData.id
					} as APIResponse),
					{
						status: 200,
						headers: {
							'content-type': 'application/json'
						}
					}
				);

			default:
				return new Response(
					JSON.stringify({
						status: torrentRes.status,
						success: false,
						error: 'Bad request. Could not add torrent'
					} as APIResponse),
					{
						status: 400,
						headers: {
							'content-type': 'application/json'
						}
					}
				);
		}
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
