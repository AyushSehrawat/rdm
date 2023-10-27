import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const getAllDownloads = async () => {
		let res = await fetch('/api/app/downloads?type=all');
		let data = await res.json();
		return data;
	};

	return {
		allDownloads: getAllDownloads()
	};
};
