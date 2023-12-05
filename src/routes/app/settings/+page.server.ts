import type { PageServerLoad } from './$types';
import { getAllData } from '$lib/app/helpers';

export const load: PageServerLoad = async ({ cookies }) => {
	const accessToken: string | undefined = cookies.get('accessToken');
	if (!accessToken) {
		return {
			streamed: {
				allData: Promise.resolve({
					downloads: [],
					torrents: []
				})
			}
		};
	}

	async function getDownloadsAndTorrents() {
		const downloads = await getAllData(fetch, 'downloads', accessToken);
		await new Promise((r) => setTimeout(r, 1000));
		const torrents = await getAllData(fetch, 'torrents', accessToken);
		return {
			downloads: downloads,
			torrents: torrents
		};
	}

	return {
		streamed: {
			allData: getDownloadsAndTorrents()
		}
	};
};
