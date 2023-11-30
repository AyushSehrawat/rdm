import type { ParsedMovie, ParsedShow } from '@ctrl/video-filename-parser';

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

// TODO: making parsedData: ParsedMovie | ParsedShow; to any for now
export interface ParsedDownloadsResponse extends DownloadsResponse {
	metadata: {
		mediaType: 'movie' | 'tv';
		parsedData: any;
	};
}

export interface ParsedTorrentsResponse extends TorrentsResponse {
	metadata: {
		mediaType: 'movie' | 'tv';
		parsedData: any;
	};
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

export interface BeforeInstallPromptEvent extends Event {
	/**
	 * Returns an array of DOMString items containing the platforms on which the event was dispatched.
	 * This is provided for user agents that want to present a choice of versions to the user such as,
	 * for example, "web" or "play" which would allow the user to chose between a web version or
	 * an Android version.
	 */
	readonly platforms: Array<string>;

	/**
	 * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
	 */
	readonly userChoice: Promise<{
		outcome: 'accepted' | 'dismissed';
		platform: string;
	}>;

	/**
	 * Allows a developer to show the install prompt at a time of their own choosing.
	 * This method returns a Promise.
	 */
	prompt(): Promise<{
		userChoice: 'accepted' | 'dismissed';
		platform: string;
	}>;
}

export interface StreamResponse {
	name: string;
	title: string;
	url: string;
	behaviorHints?: {
		[key: string]: any;
	};
}

export interface TorrentIOResponse {
	streams: StreamResponse[];
	[key: string]: any;
}
