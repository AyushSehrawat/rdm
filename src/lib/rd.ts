import { PUBLIC_CLIENT_ID, PUBLIC_BASE_AUTH_URI, PUBLIC_BASE_URI } from '$env/static/public';

type Fetch = typeof fetch;

export type DeviceCodeResponse = {
	device_code: string;
	user_code: string;
	verification_url: string;
	expires_in: number;
	interval: number;
	direct_verification_url: string;
};

export type CredentialsResponse = {
	client_id: string;
	client_secret: string;
};

export type AccessTokenResponse = {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	token_type: string;
};

export type UserResponse = {
	id: number;
	username: string;
	email: string;
	points: number;
	locale: string;
	avatar: string;
	type: string;
	premium: number;
	expiration: string;
};

export type UserTorrentResponse = {
	id: string;
	filename: string;
	hash: string;
	bytes: number;
	host: string;
	split: number;
	progress: number;
	speed: number;
	status: string;
	added: string;
	links: string[];
	ended: string;
	seeders: number;
};

export type UserDownloadResponse = {
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
};

export type UnrestrictResponse = {
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
};

export type TorrentInfoResponse = {
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
	files: {
		id: string;
		path: string;
		bytes: number;
		selected: number;
	}[];
	links: string[];
	ended: string;
	speed: number;
	seeders: number;
	fake: boolean;
};

export async function getDeviceCode(fetch: Fetch): Promise<DeviceCodeResponse> {
	try {
		const response = await fetch(
			`${PUBLIC_BASE_AUTH_URI}/oauth/v2/device/code?client_id=${PUBLIC_CLIENT_ID}&new_credentials=yes`
		);

		return await response.json();
	} catch (error) {
		console.error(`[getDeviceCode] Error fetching device code: ${error}`);
		throw error;
	}
}

export async function getCredentials(
	fetch: Fetch,
	deviceCode: string
): Promise<CredentialsResponse> {
	try {
		const response = await fetch(
			`${PUBLIC_BASE_AUTH_URI}/oauth/v2/device/credentials?client_id=${PUBLIC_CLIENT_ID}&code=${deviceCode}`
		);
		return await response.json();
	} catch (error) {
		console.error(`[getCredentials] Error fetching credentials: ${error}`);
		throw error;
	}
}

export async function getAccessToken(
	fetch: Fetch,
	clientId: string,
	clientSecret: string,
	code: string
): Promise<AccessTokenResponse> {
	try {
		const response = await fetch(`${PUBLIC_BASE_AUTH_URI}/oauth/v2/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: `grant_type=http://oauth.net/grant_type/device/1.0&client_id=${clientId}&client_secret=${clientSecret}&code=${code}`
		});
		return await response.json();
	} catch (error) {
		console.error(`[getAccessToken] Error fetching access token: ${error}`);
		throw error;
	}
}

export async function getProfile(fetch: Fetch, accessToken: string): Promise<UserResponse> {
	try {
		const response = await fetch(`${PUBLIC_BASE_URI}/user`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			}
		});
		return await response.json();
	} catch (error) {
		console.error(`[getProfile] Error fetching profile: ${error}`);
		throw error;
	}
}
