import { PUBLIC_BASE_URI } from '$env/static/public';

export const GET = async ({ url, request, cookies, fetch }) => {
	const torrentType = url.searchParams.get('type') ?? 'recent';
	const torrentLimit = url.searchParams.get('limit') ?? 5;
	let accessToken = cookies.get('accessToken') ?? '';
	const refreshToken = cookies.get('refreshToken') ?? '';

	try {
		if (refreshToken === '') {
			return new Response(JSON.stringify({ error: 'No access token or refresh token' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (accessToken === '') {
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

			accessToken = cookies.get('accessToken') ?? '';
		}

		if (torrentType === 'recent') {
			let res = await fetch(`${PUBLIC_BASE_URI}/torrents?limit=${torrentLimit}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`
				}
			});

			let data = await res.json();
			return new Response(JSON.stringify(data), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		} else if (torrentType === 'all') {
			let page = 1;
			let limit = 2500;
			let data: any[] = [];

			while (true) {
				console.log(`Fetching page ${page}`);
				const tempData = await fetch(`${PUBLIC_BASE_URI}/torrents?limit=${limit}&page=${page}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`
					}
				});

				if (!tempData.ok) {
					throw new Error(`Failed to fetch data from page ${page}`);
				}

				if (tempData.status === 204) {
					break;
				}

				try {
					const jsonData = await tempData.json();

					if (jsonData.length === 0) {
						break;
					}

					data = data.concat(jsonData);
					page++;
				} catch (error) {
					console.log(error);
					break;
				}
			}

			console.log(`Fetched ${data.length} torrents`);

			return new Response(JSON.stringify(data), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	} catch (error) {
		return new Response(JSON.stringify({ error: error?.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};

export const DELETE = async ({ request, cookies, fetch }) => {
	const body = await request.json();
	let accessToken = cookies.get('accessToken') ?? '';
	const refreshToken = cookies.get('refreshToken') ?? '';
	const ids: string[] = body.ids;
	console.log(ids);

	try {
		if (refreshToken === '') {
			return new Response(JSON.stringify({ error: 'No access token or refresh token' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (accessToken === '') {
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

			accessToken = cookies.get('accessToken') ?? '';
		}

		let deletedIds: string[] = [];
		let failures: string[] = [];

		await Promise.all(
			ids.map(async (id: string) => {
				console.log(`Deleting ${id}`);
				let res = await fetch(`${PUBLIC_BASE_URI}/torrents/delete/${id}`, {
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
			return new Response(JSON.stringify({ success: false, error: 'No torrents deleted' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		} else if (deletedIds.length === ids.length) {
			return new Response(
				JSON.stringify({
					success: true,
					message: `Deleted ${deletedIds.length} torrents`
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
					message: `Deleted ${deletedIds.length} torrents`,
					failures: failures
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}
	} catch (error) {
		return new Response(JSON.stringify({ error: error?.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
