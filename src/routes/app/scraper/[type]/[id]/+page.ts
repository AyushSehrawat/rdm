import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, data }) => {
	const type = params.type;
	const id = params.id;

	let url: string;

	if (id.startsWith('tmdb')) {
		url = `https://94c8cb9f702d-tmdb-addon.baby-beamup.club/meta/${type}/${id}.json`;
	} else if (id.startsWith('tt')) {
		url = `https://v3-cinemeta.strem.io/meta/${type}/${id}.json`;
	}

	const getIdInfo = async () => {
		const res = await fetch(url);
		const data = await res.json();
		return data;
	};

	return {
		props: { id: id, type: type, accessToken: data.accessToken },
		streamed: { getIdInfo: getIdInfo() }
	};
};
