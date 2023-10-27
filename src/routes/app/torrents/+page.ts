import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const getAllTorrents = async () => {
		let res = await fetch('/api/app/torrents?type=all');
		let data = await res.json();
		return data;
	};

	return {
		allTorrents: getAllTorrents()
	};
};
