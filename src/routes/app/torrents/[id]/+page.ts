import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const id = params.id;

	const getTorrentInfo = async () => {
		let res = await fetch(`/api/app/torrents/${id}`);
		let data = await res.json();
		return data;
	};

	return {
		props: { id: id },
		streamed: { getTorrentInfo: getTorrentInfo() }
	};
};
