<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Loader2 } from 'lucide-svelte';
	import { formatDate, convertBytes } from '$lib/app/helpers';
	import type { DownloadsResponse, TorrentsResponse } from '$lib/app/types';
	import { Separator } from '$lib/components/ui/separator';

	export let data;

	async function getUserData() {
		const res = await fetch('/api/user');
		const data = await res.json();

		if (!data.success || data.data?.error !== undefined) {
			toast.error('Error getting user data.. Logging out. ' + data.data?.error);
			const res = await fetch('/api/logout');
			invalidateAll();
		}

		return data;
	}

	function getEachSize(data: any) {
		let totalDownloadBytes = data.downloads.data.reduce(
			(total: number, download: DownloadsResponse) => total + download.filesize,
			0
		);
		let totalTorrentBytes = data.torrents.data.reduce(
			(total: number, torrent: TorrentsResponse) => total + torrent.bytes,
			0
		);

		return {
			totalDownloadsSize: convertBytes(totalDownloadBytes),
			totalTorrentsSize: convertBytes(totalTorrentBytes)
		};
	}
</script>

<div class="flex flex-col gap-4 p-8 md:px-24 lg:px-32">
	<h1 class="text-4xl font-semibold">Settings</h1>
	{#await getUserData()}
		<div class="flex items-center gap-2">
			<Loader2 class="w-4 h-4 animate-spin" />
			<p class="text-sm">Loading user data..</p>
		</div>
	{:then data}
		<div class="flex flex-col gap-2 break-words">
			<h2 class="text-lg">
				{data.data.username} <span class="text-muted-foreground text-sm">({data.data.email})</span>
			</h2>
			<p class="text-muted-foreground text-sm">
				Expires at {formatDate(data.data.expiration, 'short')}
			</p>
			<Separator />
		</div>
	{:catch error}
		<p class="text-red-500 dark:text-red-400">{error.message}</p>
	{/await}

	{#await data.streamed.allData}
		<div class="flex items-center gap-2">
			<Loader2 class="w-4 h-4 animate-spin" />
			<p class="text-sm">Getting torrents and downloads..</p>
		</div>
	{:then data}
		{@const { totalDownloadsSize, totalTorrentsSize } = getEachSize(data)}
		<div class="flex flex-col gap-2">
			<p>Total downloads size: <span class="font-semibold">{totalDownloadsSize}</span></p>
			<p>Total torrents size: <span class="font-semibold">{totalTorrentsSize}</span></p>
		</div>
	{/await}
</div>
