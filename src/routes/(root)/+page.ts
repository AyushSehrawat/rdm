import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
	const clientId = data.clientId;
	return {
		clientId: clientId
	};
};
