export interface DeviceCodeResponse {
	device_code: string;
	user_code: string;
	verification_url: string;
	expires_in: number;
	interval: number;
	direct_verification_url: string;
}

export interface CredentialsResponse {
	client_id: string;
	client_secret: string;
}

export interface AccessTokenResponse {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	token_type: string;
}

export interface UserResponse {
	id: number;
	username: string;
	email: string;
	points: number;
	locale: string;
	avatar: string;
	type: string;
	premium: number;
	expiration: string;
}

export interface DownloadsResponse {
	id: string;
	filename: string;
	mimeType: string;
	filesize: number;
	link: string;
	host: string;
	host_icon: string;
	chunks: number;
	download: string;
	streamable: number;
	generated: string;
}

export interface TorrentsResponse {
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

export interface TorrentInfoFiles {
	id: number;
	path: string;
	bytes: number;
	selected: number;
}

export interface TorrentInfoResponse {
	id: string;
	filename: string;
	original_filename: string;
	hash: string;
	bytes: number;
	original_bytes: number;
	host: string;
	split: number;
	progress: number;
	status: string;
	added: string;
	files: TorrentInfoFiles[];
	links: string[];
	ended: string;
}

export interface AddMagnetResponse {
	id: string;
	uri: string;
}

export interface UnrestrictResponse {
	id: string;
	filename: string;
	mimeType: string;
	filesize: number;
	link: string;
	host: string;
	chunks: number;
	crc: number;
	download: string;
	streamable: number;
}

export interface VideoResponse {
	name: string;
	season: number | string;
	number: number;
	firstAired: string;
	tvdb_id: number;
	rating: number;
	overview: string;
	thumbnail: string;
	id: number;
	released: string;
	episode: number;
	description: string;
}

export interface SeasonDictType {
	[key: string]: VideoResponse[];
}

export interface BuildTreeNode {
	path?: string;
	children: BuildTreeNode[];
	file?: TorrentInfoFiles;
}

export interface DateTimeFormatOptions {
	year?: 'numeric' | '2-digit';
	month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
	day?: 'numeric' | '2-digit';
	hour?: 'numeric' | '2-digit';
	minute?: 'numeric' | '2-digit';
	second?: 'numeric' | '2-digit';
	timeZone?: string;
}

export interface NavItem {
	name: string;
	ref: string;
}

export interface APIResponse<T = any> {
	status: number;
	success: boolean;
	message?: string;
	error?: string;
	data?: T;
	[key: string]: any;
}
