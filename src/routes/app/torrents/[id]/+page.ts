import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const id = params.id;

	const getTorrentInfo = async () => {
		const res = await fetch(`/api/app/torrents/${id}`);
		const data = await res.json();
		return data;
	};

	return {
		props: { id: id },
		streamed: { getTorrentInfo: getTorrentInfo() }
	};
};
