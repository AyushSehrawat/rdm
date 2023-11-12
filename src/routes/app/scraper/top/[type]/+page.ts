import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const type = params.type;

	const getTopType = async () => {
		const res = await fetch(`https://cinemeta-catalogs.strem.io/top/catalog/${type}/top.json`);
		const data = await res.json();
		return data;
	};

	return {
		type: type,
		top: getTopType()
	};
};
