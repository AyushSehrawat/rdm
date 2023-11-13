import { PUBLIC_BASE_URI } from '$env/static/public';

export const POST = async ({ request, cookies, fetch }) => {
	const body = await request.json();
	let accessToken = cookies.get('accessToken');
	const refreshToken = cookies.get('refreshToken');
	const links: string[] = body.links;
	console.log(links);

	try {
		if (!refreshToken) {
			return new Response(JSON.stringify({ error: 'No access token or refresh token' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (!accessToken) {
			const res = await fetch('/api/refresh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const data = await res.json();
			if ('error' in data) {
				return new Response(JSON.stringify({ error: 'No access token or refresh token' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			accessToken = cookies.get('accessToken');
		}

		const unrestrictedIdsData: any[] = [];
		const failures: string[] = [];

		await Promise.all(
			links.map(async (link: string) => {
				console.log(`Unrestricting ${link}`);
				const res = await fetch(`${PUBLIC_BASE_URI}/unrestrict/link`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`
					},
					body: `link=${link}&password=`
				});
				const data = await res.json();

				if (res.status === 200) {
					unrestrictedIdsData.push({ id: data.id, download: data.download });
				} else {
					failures.push(link);
				}
			})
		);

		if (unrestrictedIdsData.length === 0) {
			return new Response(JSON.stringify({ success: false, error: 'No files unrestricted' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		} else if (unrestrictedIdsData.length === links.length) {
			return new Response(
				JSON.stringify({
					success: true,
					data: unrestrictedIdsData,
					message: `Unrestricted ${unrestrictedIdsData.length} / ${links.length} torrent files`
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
					data: unrestrictedIdsData,
					message: `Unrestricted ${unrestrictedIdsData.length} / ${links.length} torrent files`,
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
