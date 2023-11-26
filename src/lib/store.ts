import { writable } from 'svelte/store';
import type { DownloadsResponse } from './app/types';
import type { Writable } from 'svelte/store';

export const currentDownloadData: Writable<DownloadsResponse> = writable<DownloadsResponse>();
