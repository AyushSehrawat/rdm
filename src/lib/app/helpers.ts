import type {
	VideoResponse,
	SeasonDictType,
	TorrentInfoFiles,
	BuildTreeNode,
	DateTimeFormatOptions
} from '$lib/app/types';

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
	let options: DateTimeFormatOptions;
	const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	if (format === 'short') {
		options = {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		};
	} else {
		options = {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			timeZone: userTimeZone
		};
	}

	const formattedDate = new Date(inputDate).toLocaleString('en-US', options);
	if (formattedDate.includes('Invalid Date')) {
		const fallbackOptions: DateTimeFormatOptions = {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			timeZone: 'UTC'
		};
		return new Date(inputDate).toLocaleString('en-US', fallbackOptions);
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
