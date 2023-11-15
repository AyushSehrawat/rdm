import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const provider: string = params.provider;
	const category: string = params.category;
	const type: string = params.type;

	let url: string;

	if (provider === 'cinemeta') {
		if (category === 'top') {
			url = `https://cinemeta-catalogs.strem.io/top/catalog/${type}/top.json`;
		} else if (category === 'featured') {
			url = `https://cinemeta-catalogs.strem.io/imdbRating/catalog/${type}/imdbRating.json`;
		}
	} else if (provider === 'trakt') {
		url = `https://2ecbbd610840-trakt.baby-beamup.club/catalog/trakt/trakt_${category}_${type}.json`;
	} else if (provider === 'tmdb') {
		url = `https://94c8cb9f702d-tmdb-addon.baby-beamup.club/catalog/${type}/tmdb.top.json`;
	}

	// trakt -> movies, series
	// rest -> movie, series

	const getProviderCategoryType = async () => {
		const res = await fetch(url);
		const data = await res.json();
		return data;
	};

	return {
		provider: provider,
		category: category,
		type: type,
		items: getProviderCategoryType()
	};
};
