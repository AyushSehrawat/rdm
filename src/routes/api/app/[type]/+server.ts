import { PUBLIC_BASE_URI } from '$env/static/public';
import type {
	APIResponse,
	TorrentsResponse,
	DownloadsResponse,
	ParsedTorrentsResponse,
	ParsedDownloadsResponse
} from '$lib/app/types';
import { getFilenameMetadata } from '$lib/app/helpers.js';
import Fuse from 'fuse.js';

const downloadsFuseOptions = {
	shouldSort: true,
	keys: ['id', 'filename']
};

const torrentsFuseOptions = {
	shouldSort: true,
	keys: ['id', 'filename', 'hash']
};

export const GET = async ({ url, fetch, cookies, params }) => {
	const datatype: string = params.type;
	let accessToken: string | undefined = cookies.get('accessToken');
	const refreshToken: string | undefined = cookies.get('refreshToken');

	const limit: number = Number(url.searchParams.get('limit')) || 10;
	const page: number = Number(url.searchParams.get('page')) || 1;
	const query: string | null = url.searchParams.get('query');

	console.log(datatype);

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

		if (limit <= 0 || limit > 2500) {
			return new Response(
				JSON.stringify({
					status: 400,
					success: false,
					error: 'Bad Request. Limit must be between 1 and 2500'
				} as APIResponse),
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
					success: false,
					error: 'Bad Request. Page must be greater than 0'
				} as APIResponse),
				{
					status: 400,
					headers: {
						'content-type': 'application/json'
					}
				}
			);
		}

		if (!query) {
			let url = '';
			if (datatype === 'downloads') {
				url = `${PUBLIC_BASE_URI}/downloads?limit=${limit}&page=${page}`;
			} else if (datatype === 'torrents') {
				url = `${PUBLIC_BASE_URI}/torrents?limit=${limit}&page=${page}`;
			}

			const res = await fetch(url, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				}
			});
			if (!res.ok)
				return new Response(
					JSON.stringify({
						success: false,
						status: res.status,
						error: res.statusText
					} as APIResponse),
					{ status: res.status, headers: { 'Content-Type': 'application/json' } }
				);

			const totalCount: string | null = res.headers.get('X-Total-Count');
			const dataTypeItems = await res.json();
			const updatedItems = dataTypeItems.map((item: DownloadsResponse | TorrentsResponse) => {
				return { ...item, metadata: getFilenameMetadata(item.filename) };
			});

			return new Response(
				JSON.stringify({
					success: true,
					status: 200,
					data: updatedItems,
					totalCount: totalCount,
					limit: limit,
					page: page
				} as APIResponse<ParsedDownloadsResponse[] | ParsedTorrentsResponse[]>),
				{
					status: 200,
					headers: {
						'content-type': 'application/json'
					}
				}
			);
		} else {
			let url = '';
			if (datatype === 'downloads') {
				url = `${PUBLIC_BASE_URI}/downloads`;
			} else if (datatype === 'torrents') {
				url = `${PUBLIC_BASE_URI}/torrents`;
			}

			const queryTotalCountRes = await fetch(`${url}?limit=1&page=1`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`
				}
			});

			const queryTotalCount = parseInt(queryTotalCountRes.headers.get('X-Total-Count') || '0');
			const queryLimit = 2500;
			const queryTotalPages = Math.ceil(queryTotalCount / queryLimit);

			const queryPageNumbers = Array.from({ length: queryTotalPages }, (_, i) => i + 1);
			const queryChunkSize = 10;
			const queryDelay = 500;

			const allData = [];

			for (let i = 0; i < queryPageNumbers.length; i += queryChunkSize) {
				const chunk = queryPageNumbers.slice(i, i + queryChunkSize);
				const promises = chunk.map(fetchPage);
				const data = await Promise.all(promises);
				allData.push(...data);
				if (i + queryChunkSize < queryPageNumbers.length) {
					await new Promise((resolve) => setTimeout(resolve, queryDelay));
				}
			}

			async function fetchPage(queryPage: number) {
				console.log(`Fetching page ${queryPage}`);
				const response = await fetch(`${url}?limit=${queryLimit}&page=${queryPage}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`
					}
				});

				if (!response.ok) {
					throw new Error(`Error fetching page ${queryPage}. Status: ${response.status}`);
				}

				return (await response.json()) as TorrentsResponse[];
			}

			const data = allData.flat();

			let fuseOptions = {};
			if (datatype === 'downloads') {
				fuseOptions = downloadsFuseOptions;
			} else if (datatype === 'torrents') {
				fuseOptions = torrentsFuseOptions;
			}

			const fuse = new Fuse(data, fuseOptions);
			let searchResults = fuse.search(query).map((result) => result.item);
			const updatedItems = searchResults.map((item: DownloadsResponse | TorrentsResponse) => {
				return { ...item, metadata: getFilenameMetadata(item.filename) };
			});

			return new Response(
				JSON.stringify({
					status: 200,
					success: true,
					data: updatedItems,
					totalCount: queryTotalCount,
					limit: queryLimit,
					page: queryTotalPages,
					query: query
				} as APIResponse<ParsedDownloadsResponse[]> | APIResponse<ParsedTorrentsResponse[]>),
				{
					status: 200,
					headers: {
						'content-type': 'application/json'
					}
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
