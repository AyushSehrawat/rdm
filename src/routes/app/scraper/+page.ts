import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const query = url.searchParams.get('query');

	if (query && query.length > 0) {
		let moviesRes = await fetch(
			`https://v3-cinemeta.strem.io/catalog/movie/top/search=${query}.json`
		);
		let seriesRes = await fetch(
			`https://v3-cinemeta.strem.io/catalog/series/top/search=${query}.json`
		);

		let movies = await moviesRes.json();
		let series = await seriesRes.json();

		return {
			movies: movies.metas,
			series: series.metas
		};
	} else {
		return {
			movies: [],
			series: []
		};
	}
};
