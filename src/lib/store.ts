import { writable } from 'svelte/store';
import type { DownloadsResponse } from './app/types';

export const currentDownloadData = writable<DownloadsResponse>();
