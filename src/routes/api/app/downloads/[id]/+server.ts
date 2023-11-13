import { PUBLIC_BASE_URI } from '$env/static/public';

export const DELETE = async ({ cookies, fetch, params }) => {
	const id = params.id;
	let accessToken = cookies.get('accessToken');
	const refreshToken = cookies.get('refreshToken');
	console.log(`Deleting download ${id}`);

	try {
		if (!refreshToken) {
			return new Response(
				JSON.stringify({ success: false, error: 'No access token or refresh token' }),
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
			if ('error' in data) {
				return new Response(
					JSON.stringify({ success: false, error: 'No access token or refresh token' }),
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

		let success;

		if (res.status === 204) {
			success = true;
		} else {
			success = false;
		}

		return new Response(
			JSON.stringify({ success: success, code: res.status, message: `Deleted download ${id}` }),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ success: false, error: error }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
