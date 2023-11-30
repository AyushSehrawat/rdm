import { PUBLIC_BASE_URI } from '$env/static/public';
import type { APIResponse, TorrentsResponse } from '$lib/app/types';

export const POST = async ({ fetch, cookies, request }) => {
	let accessToken: string | undefined = cookies.get('accessToken');
	const refreshToken: string | undefined = cookies.get('refreshToken');
	const body = await request.json();
	const hashes: string[] = body.hashes;

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

			accessToken = cookies.get('accessToken');
		}

		if (!hashes) {
			return new Response(
				JSON.stringify({
					status: 400,
					success: false,
					error: 'Bad Request. No hashes provided.'
				} as APIResponse),
				{
					status: 400,
					headers: {
						'content-type': 'application/json'
					}
				}
			);
		}

		const totalCountRes = await fetch(`${PUBLIC_BASE_URI}/torrents?limit=1&page=1`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			}
		});

		const totalCount = parseInt(totalCountRes.headers.get('X-Total-Count') || '0');
		const limit = 2500;
		const totalPages = Math.ceil(totalCount / limit);

		const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
		const chunkSize = 10;
		const delay = 500;

		const allData = [];

		for (let i = 0; i < pageNumbers.length; i += chunkSize) {
			const chunk = pageNumbers.slice(i, i + chunkSize);
			const promises = chunk.map(fetchPage);
			const data = await Promise.all(promises);
			allData.push(...data);
			if (i + chunkSize < pageNumbers.length) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		async function fetchPage(page: number) {
			console.log(`Fetching page ${page}`);
			const response = await fetch(`${PUBLIC_BASE_URI}/torrents?limit=${limit}&page=${page}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (!response.ok) {
				throw new Error(`Error fetching page ${page}. Status: ${response.status}`);
			}

			return (await response.json()) as TorrentsResponse[];
		}

		const data = allData.flat();
		const foundHashes = data
			.filter((torrent) => hashes.includes(torrent.hash))
			.map((torrent) => torrent.hash);

		return new Response(
			JSON.stringify({
				status: 200,
				success: true,
				data: {
					hashes: foundHashes
				}
			} as APIResponse),
			{
				status: 200,
				headers: {
					'content-type': 'application/json'
				}
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
