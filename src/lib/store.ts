import { writable } from 'svelte/store';

type DownloadsType = {
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

export const currentDownloadData = writable<DownloadsType>();
