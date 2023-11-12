import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const limit = Number(url.searchParams.get('limit')) || 10;
	const page = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('query');
	console.log({ limit, page, query });

	if (limit <= 0 || limit > 2500) {
		return {
			status: 400,
			error: 'Bad Request',
			message: 'Limit must be between 1 and 2500'
		};
	}

	if (page <= 0) {
		return {
			status: 400,
			error: 'Bad Request',
			message: 'Page must be greater than 0'
		};
	}
	const getDownloads = async () => {
		const res = await fetch(`/api/app/downloads?limit=${limit}&page=${page}`);
		const data = await res.json();
		return data;
	};

	const getQueryDownloads = async () => {
		const res = await fetch(`/api/app/downloads?limit=${limit}&page=${page}&query=${query}`);
		const data = await res.json();
		return data;
	};

	if (query) {
		return {
			downloads: getQueryDownloads()
		};
	}
	return {
		downloads: getDownloads()
	};
};
