import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/changelog.json');
	const data = await response.json();
	return { data };
};
