import { PUBLIC_BASE_URI } from '$env/static/public';
import type { DownloadsType } from '$lib/app/types';

export const GET = async ({ url, fetch, cookies }) => {
	let accessToken = cookies.get('accessToken');
	const refreshToken = cookies.get('refreshToken');
	let limit = Number(url.searchParams.get('limit')) || 10;
	let page = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('query');

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

		if (!accessToken) {
			let res = await fetch('/api/refresh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let data = await res.json();
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

		if (limit <= 0 || limit > 2500) {
			return new Response(
				JSON.stringify({
					status: 400,
					error: 'Bad Request',
					message: 'Limit must be between 1 and 2500'
				}),
				{
					status: 400,
					headers: {
						'content-type': 'application/json'
					}
				}
			);
		}

		if (page <= 0) {
			return new Response(
				JSON.stringify({
					status: 400,
					error: 'Bad Request',
					message: 'Page must be greater than 0'
				}),
				{
					status: 400,
					headers: {
						'content-type': 'application/json'
					}
				}
			);
		}

		if (!query) {
			const res = await fetch(`${PUBLIC_BASE_URI}/downloads?limit=${limit}&page=${page}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				}
			});
			if (!res.ok) return new Response(res.statusText, { status: res.status });

			const totalCount = res.headers.get('X-Total-Count');
			const downloads: DownloadsType[] = await res.json();

			return new Response(
				JSON.stringify({
					downloads: downloads,
					totalCount: totalCount,
					limit: limit,
					page: page
				}),
				{
					status: 200,
					headers: {
						'content-type': 'application/json'
					}
				}
			);
		} else {
			let queryLimit = 2500;
			let queryPage = 1;
			let queryData: DownloadsType[] = [];
			let queryTotalCount;

			while (true) {
				console.log(`Querying page ${queryPage}...`);

				const tempData = await fetch(
					`${PUBLIC_BASE_URI}/downloads?limit=${queryLimit}&page=${queryPage}`,
					{
						method: 'GET',
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'Content-Type': 'application/json'
						}
					}
				);

				if (!tempData.ok) return new Response(tempData.statusText, { status: tempData.status });

				if (tempData.status === 204) {
					console.log('No more data to query.');
					break;
				}

				try {
					const tempJsonData = await tempData.json();
					if (tempJsonData.length === 0) {
						console.log('No more data to query.');
						break;
					}

					for (let i = 0; i < tempJsonData.length; i++) {
						if (tempJsonData[i].filename.toLowerCase().includes(query.toLowerCase())) {
							queryData.push(tempJsonData[i]);
						}
					}

					queryTotalCount = tempData.headers.get('X-Total-Count');
					queryPage++;
				} catch (e) {
					console.log(e);
					break;
				}
			}

			return new Response(
				JSON.stringify({
					downloads: queryData,
					totalCount: queryTotalCount,
					limit: queryLimit,
					page: queryPage
				}),
				{
					status: 200,
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

export const DELETE = async ({ request, cookies, fetch }) => {
	const body = await request.json();
	let accessToken = cookies.get('accessToken');
	const refreshToken = cookies.get('refreshToken');
	const ids: string[] = body.ids;
	console.log(ids);

	try {
		if (!refreshToken) {
			return new Response(JSON.stringify({ error: 'No access token or refresh token' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (!accessToken) {
			let res = await fetch('/api/refresh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let data = await res.json();
			if ('error' in data) {
				return new Response(JSON.stringify({ error: 'No access token or refresh token' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			accessToken = cookies.get('accessToken');
		}

		let deletedIds: string[] = [];
		let failures: string[] = [];

		await Promise.all(
			ids.map(async (id: string) => {
				console.log(`Deleting ${id}`);
				let res = await fetch(`${PUBLIC_BASE_URI}/downloads/delete/${id}`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`
					}
				});

				if (res.status === 204) {
					deletedIds.push(id);
				} else {
					failures.push(id);
				}
			})
		);

		if (deletedIds.length === 0) {
			return new Response(JSON.stringify({ success: false, error: 'No downloads deleted' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		} else if (deletedIds.length === ids.length) {
			return new Response(
				JSON.stringify({
					success: true,
					message: `Deleted ${deletedIds.length} downloads`
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		} else {
			return new Response(
				JSON.stringify({
					success: 'partial',
					message: `Deleted ${deletedIds.length} downloads`,
					failures: failures
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' }
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
