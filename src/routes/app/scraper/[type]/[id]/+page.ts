import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const type = params.type;
	const id = params.id;

	const getIdInfo = async () => {
		let res = await fetch(`https://v3-cinemeta.strem.io/meta/${type}/${id}.json`);
		let data = await res.json();
		return data;
	};

	return {
		props: { id: id },
		streamed: { getIdInfo: getIdInfo() }
	};
};
