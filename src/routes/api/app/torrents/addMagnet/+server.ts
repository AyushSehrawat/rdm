import { PUBLIC_BASE_URI } from '$env/static/public';
import type { AddMagnetType } from '$lib/app/types.js';

export const POST = async ({ fetch, cookies, request }) => {
	let accessToken = cookies.get('accessToken');
	const refreshToken = cookies.get('refreshToken');
	const body = await request.json();
	const hash = body?.hash;
	const selectedFilesId = body?.selectedFilesId;

	try {
		if (!refreshToken) {
			return new Response(
				JSON.stringify({
					status: 401,
					error: 'Unauthorized',
					message: 'No access token or refresh token'
				}),
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
					error: 'Bad Request',
					message: 'No hash provided'
				}),
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
					error: 'Bad Request',
					message: 'No selectedFilesId provided'
				}),
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

			const data = await res.json();
			if ('error' in data) {
				return new Response(
					JSON.stringify({
						status: 401,
						error: 'Unauthorized',
						message: 'No access token or refresh token'
					}),
					{
						status: 401,
						headers: {
							'content-type': 'application/json'
						}
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
					status: 400,
					error: 'Bad Request',
					message: 'Could not add magnet'
				}),
				{
					status: 400,
					headers: {
						'content-type': 'application/json'
					}
				}
			);
		}

		const magnetData: AddMagnetType = await magnetRes.json();

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
						message: 'Torrent reinserted',
						id: magnetData.id
					}),
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
						message: 'Torrent already added',
						id: magnetData.id
					}),
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
						error: 'Bad request. Could not add torrent'
					}),
					{
						status: 400,
						headers: {
							'content-type': 'application/json'
						}
					}
				);
		}
	} catch (error) {
		return new Response(JSON.stringify({ error: error }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
