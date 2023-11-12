import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const query = url.searchParams.get('query');

	if (query && query.length > 0) {
		const moviesRes = await fetch(
			`https://v3-cinemeta.strem.io/catalog/movie/top/search=${query}.json`
		);
		const seriesRes = await fetch(
			`https://v3-cinemeta.strem.io/catalog/series/top/search=${query}.json`
		);

		const movies = await moviesRes.json();
		const series = await seriesRes.json();

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
