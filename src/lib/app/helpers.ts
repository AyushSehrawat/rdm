import type {
	VideoResponse,
	SeasonDictType,
	TorrentInfoFiles,
	BuildTreeNode,
	TorrentIOResponse
} from '$lib/app/types';
import { filenameParse, type ParsedMovie, type ParsedShow } from '@ctrl/video-filename-parser';
import { DateTime, Settings } from 'luxon';

Settings.defaultZone = 'utc'; // Set default timezone to UTC

export function convertBytes(byteSize: number): string {
	if (byteSize < 1024) {
		return byteSize + ' bytes';
	} else if (byteSize < 1024 * 1024) {
		return (byteSize / 1024).toFixed(2) + ' KB';
	} else if (byteSize < 1024 * 1024 * 1024) {
		return (byteSize / (1024 * 1024)).toFixed(2) + ' MB';
	} else {
		return (byteSize / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
	}
}

export function formatDate(inputDate: string, format: string = 'long'): string {
	let cetDate = DateTime.fromISO(inputDate, { zone: 'Europe/Paris' }); // Parse date as CET
	cetDate = cetDate.setZone('utc'); // Convert to UTC

	const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get user's timezone
	cetDate = cetDate.setZone(userTimeZone); // Convert to user's timezone

	let formattedDate;
	if (format === 'short') {
		formattedDate = cetDate.toLocaleString({
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	} else {
		formattedDate = cetDate.toLocaleString(DateTime.DATETIME_FULL);
	}

	return formattedDate;
}

export function capitalizeFirstLetter(string: string): string {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function removeFirstChar(str: string): string {
	return str.slice(1);
}

export function isStreamable(num: number | null): string {
	return num === 1 ? 'Streamable' : 'Not Streamable';
}

export function organizeVideosBySeason(videos: VideoResponse[]) {
	console.log(`Organizing ${videos.length} videos by season...`);
	const seasonsDict: SeasonDictType = {};

	videos.forEach((video) => {
		const seasonNum = video.season;

		if (!seasonsDict[seasonNum]) {
			seasonsDict[seasonNum] = [];
		}

		seasonsDict[seasonNum].push(video);
	});

	return seasonsDict;
}

export function debounce<F extends (...args: any[]) => Promise<void>>(
	func: F,
	timeout = 500
): (...args: Parameters<F>) => void {
	let timer: NodeJS.Timeout;
	return async (...args: Parameters<F>) => {
		clearTimeout(timer);
		timer = setTimeout(async () => {
			await func(...args);
		}, timeout);
	};
}

export function buildTree(files: TorrentInfoFiles[]): BuildTreeNode[] {
	console.log('Building tree...');
	const root: BuildTreeNode = { children: [] };

	files.forEach((file) => {
		const parts = file.path.split('/').filter((part) => part !== '');
		let currentNode = root;

		parts.forEach((part) => {
			if (!currentNode.children) {
				currentNode.children = [];
			}

			let existingNode = currentNode.children.find((node) => node.path === part);
			if (!existingNode) {
				existingNode = { path: part, children: [] };
				currentNode.children.push(existingNode);
			}

			currentNode = existingNode;
		});

		currentNode.file = file;
	});

	return root.children;
}

export const getMediaType = (filename: string): 'tv' | 'movie' => {
	return /seasons?.\d/i.test(filename) ||
		/s\d\d/i.test(filename) ||
		/\b(tv|complete)/i.test(filename) ||
		/\b(saison|stage)[\s\.]?\d/i.test(filename)
		? 'tv'
		: 'movie';
};

export const getFilenameMetadata = (filename: string) => {
	switch (getMediaType(filename)) {
		case 'tv':
			return {
				mediaType: 'tv',
				parsedData: filenameParse(filename, true) as ParsedShow
			};
		case 'movie':
			return {
				mediaType: 'movie',
				parsedData: filenameParse(filename) as ParsedMovie
			};
	}
};

const regex = /\/([a-fA-F0-9]{40})\//;

export function getHash(url: string | null): string | null {
	if (!url) {
		return null;
	}
	const match = url.match(regex);
	return match ? match[1] : null;
}

export function getHashes(data: TorrentIOResponse) {
	const urls = data.streams.map((stream) => stream.url);
	const hashes = urls.map((url) => {
		return getHash(url);
	});

	return hashes.filter((hash) => hash !== null);
}
