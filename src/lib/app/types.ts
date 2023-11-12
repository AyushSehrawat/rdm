export interface UserDataType {
	avatar: string;
	email: string;
	expiration: string;
	id: number;
	locale: string;
	points: number;
	premium: number;
	type: string;
	username: string;
}

export type DownloadsType = {
	chunks: number;
	download: string;
	filename: string;
	filesize: number;
	generated: string;
	host: string;
	host_icon: string;
	id: string;
	link: string;
	mimeType: string | null;
	streamable: number | null;
};

export interface TorrentsType {
	added: string;
	bytes: number;
	ended: string | null | undefined;
	filename: string;
	hash: string;
	host: string;
	id: string;
	links: string[];
	progress: number | null | undefined;
	split: number;
	status: string;
}
