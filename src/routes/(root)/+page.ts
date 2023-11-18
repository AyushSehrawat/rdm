import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
	const clientId: string | undefined = data.clientId;
	return {
		clientId: clientId
	};
};
