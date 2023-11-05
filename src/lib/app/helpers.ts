interface VideoType {
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

interface SeasonDictType {
	[key: string]: VideoType[];
}

export function convertBytes(byteSize: number) {
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

export function formatDate(inputDate: string) {
	const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const options = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		timeZone: userTimeZone
	};
	// @ts-ignore
	const formattedDate = new Date(inputDate).toLocaleString('en-US', options);
	if (formattedDate.includes('Invalid Date')) {
		const fallbackOptions = {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			timeZone: 'UTC'
		};
		// @ts-ignore
		return new Date(inputDate).toLocaleString('en-US', fallbackOptions);
	}
	return formattedDate;
}

export function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function removeFirstChar(str: string) {
	return str.slice(1);
}

export function isStreamable(num: number | null) {
	return num === 1 ? 'Streamable' : 'Not Streamable';
}

export function organizeVideosBySeason(videos: VideoType[]) {
	console.log(`Organizing ${videos.length} videos by season...`);
	const seasonsDict: SeasonDictType = {};

	videos.forEach((video) => {
		let seasonNum = video.season;

		/*if (seasonNum === 0) {
			seasonNum = 'Specials';
		}*/

		if (!seasonsDict[seasonNum]) {
			seasonsDict[seasonNum] = [];
		}

		seasonsDict[seasonNum].push(video);
	});

	return seasonsDict;
}
