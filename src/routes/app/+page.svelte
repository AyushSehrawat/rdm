<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { RotateCw, Loader2 } from 'lucide-svelte';
	import { DotsHorizontal } from 'radix-icons-svelte';
	import { goto } from '$app/navigation';
	import { formatDate, convertBytes, capitalizeFirstLetter } from '$lib/app/helpers';
	import { toast } from 'svelte-sonner';
	import { currentDownloadData } from '$lib/store';
	import type { DownloadsResponse } from '$lib/app/types';
	import Filename from '$lib/components/app/datatable/filename.svelte';

	let downloadRefresh = false;
	let torrentRefresh = false;

	let recentDownloads = async function recentDownloadsData() {
		const data = await fetch(`/api/app/downloads?limit=5&page=1`);
		downloadRefresh = false;
		return data.json();
	};
	let doRecentDownloads = recentDownloads();
	function refreshRecentDownloads() {
		downloadRefresh = true;
		doRecentDownloads = recentDownloads();
	}

	let recentTorrents = async function recentTorrentsData() {
		const data = await fetch(`/api/app/torrents?limit=5&page=1`);
		torrentRefresh = false;
		return data.json();
	};
	let doRecentTorrents = recentTorrents();
	function refreshRecentTorrents() {
		torrentRefresh = true;
		doRecentTorrents = recentTorrents();
	}

	let deleteDownload = async function deleteDownloadData(id: string) {
		const data = await fetch(`/api/app/downloads/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		let resp = await data.json();
		if (resp.success === true) {
			toast.success(`Success! ${resp.message}`);
		} else if (resp.success === false) {
			toast.error(`Error! ${resp.error}`);
		}
		doRecentDownloads = recentDownloads();
	};

	let deleteTorrent = async function deleteTorrentData(id: string) {
		const data = await fetch(`/api/app/torrents/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		let resp = await data.json();
		if (resp.success === true) {
			toast.success(`Success! ${resp.message}`);
		} else if (resp.success === false) {
			toast.error(`Error! ${resp.error}`);
		}
		doRecentTorrents = recentTorrents();
	};

	function setCurrentDataAndRedirect(data: DownloadsResponse) {
		currentDownloadData.set(data);
		goto(`/app/downloads/${data.id}`);
	}
</script>

<svelte:head>
	<title>Home | RDM</title>
</svelte:head>

<div class="p-8 md:px-24 lg:px-32 flex flex-col">
	<div class="flex items-center justify-between mt-8">
		<h3 class="font-semibold">Recent Downloads</h3>
		<Button variant="outline" disabled={downloadRefresh} on:click={refreshRecentDownloads}>
			{#if downloadRefresh}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<RotateCw class="mr-2 h-4 w-4" />
			{/if}
			Refresh
		</Button>
	</div>
	{#await doRecentDownloads}
		<div class="flex w-full items-center justify-center">
			<Loader2 class="h-8 w-8 animate-spin" />
		</div>
	{:then data}
		<Table.Root class="my-2 mb-8">
			<Table.Caption>Your last 5 Downloads</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head>Filename</Table.Head>
					<Table.Head>Size</Table.Head>
					<Table.Head>Generated</Table.Head>
					<Table.Head>Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if data.data}
					{#each data.data as download}
						<Table.Row>
							<Table.Cell class="flex flex-col gap-1 items-start">
								<Filename filedata={download} />
							</Table.Cell>
							<Table.Cell>{convertBytes(download.filesize)}</Table.Cell>
							<Table.Cell>{formatDate(download.generated)}</Table.Cell>
							<Table.Cell>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger asChild let:builder>
										<Button variant="ghost" builders={[builder]} class="w-8 h-8 p- relative">
											<span class="sr-only">Open menu</span>
											<DotsHorizontal class="w-4 h-4" />
										</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											<DropdownMenu.Label>Actions</DropdownMenu.Label>
											<DropdownMenu.Separator />
											<DropdownMenu.Item
												on:click={() => {
													navigator.clipboard.writeText(download.id);
													toast.success('Copied ID to clipboard');
												}}>Copy ID</DropdownMenu.Item
											>
											<DropdownMenu.Item
												on:click={() => {
													navigator.clipboard.writeText(download.download);
													toast.success('Download link copied to clipboard!');
												}}>Copy Download Link</DropdownMenu.Item
											>
											<DropdownMenu.Separator />
											<DropdownMenu.Item
												on:click={() => {
													setCurrentDataAndRedirect(download);
												}}>Details</DropdownMenu.Item
											>
											<DropdownMenu.Item
												on:click={() => {
													deleteDownload(download.id);
												}}>Delete</DropdownMenu.Item
											>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				{:else}
					<Table.Row>
						<Table.Cell>
							<div class="flex items-center justify-center">
								<p class="text-gray-500">No downloads found</p>
							</div>
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	{:catch error}
		<div class="flex w-full items-center justify-center">
			<p class="text-red-500">Error: {error.message}</p>
		</div>
	{/await}

	<div class="flex items-center justify-between mt-8">
		<h3 class="font-semibold">Recent Torrents</h3>
		<Button variant="outline" disabled={torrentRefresh} on:click={refreshRecentTorrents}>
			{#if torrentRefresh}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<RotateCw class="mr-2 h-4 w-4" />
			{/if}
			Refresh
		</Button>
	</div>
	{#await doRecentTorrents}
		<div class="flex w-full items-center justify-center">
			<Loader2 class="h-8 w-8 animate-spin" />
		</div>
	{:then data}
		<Table.Root class="my-2 mb-8">
			<Table.Caption>Your last 5 Torrents</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head>Filename</Table.Head>
					<Table.Head>Size</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Added</Table.Head>
					<Table.Head>Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if data.data}
					{#each data.data as torrent}
						<Table.Row>
							<Table.Cell class="flex flex-col gap-1 items-start">
								<Filename filedata={torrent} />
							</Table.Cell>
							<Table.Cell>{convertBytes(torrent.bytes)}</Table.Cell>
							<Table.Cell>{capitalizeFirstLetter(torrent.status)}</Table.Cell>
							<Table.Cell>{formatDate(torrent.added)}</Table.Cell>
							<Table.Cell>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger asChild let:builder>
										<Button variant="ghost" builders={[builder]} class="w-8 h-8 p- relative">
											<span class="sr-only">Open menu</span>
											<DotsHorizontal class="w-4 h-4" />
										</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											<DropdownMenu.Label>Actions</DropdownMenu.Label>
											<DropdownMenu.Separator />
											<DropdownMenu.Item
												on:click={() => {
													navigator.clipboard.writeText(torrent.id);
													toast.success('Copied ID to clipboard');
												}}>Copy ID</DropdownMenu.Item
											>
											<DropdownMenu.Item
												on:click={() => {
													navigator.clipboard.writeText(`magnet:?xt=urn:btih:${torrent.hash}`);
													toast.success('Copied magnet url to clipboard');
												}}>Copy magnet url</DropdownMenu.Item
											>
											<DropdownMenu.Item
												on:click={() => {
													navigator.clipboard.writeText(torrent.hash);
													toast.success('Copied hash to clipboard');
												}}>Copy hash</DropdownMenu.Item
											>
											<DropdownMenu.Separator />
											<DropdownMenu.Item
												on:click={() => {
													goto(`/app/torrents/${torrent.id}`);
												}}>Details</DropdownMenu.Item
											>
											<DropdownMenu.Item
												on:click={() => {
													deleteTorrent(torrent.id);
												}}>Delete</DropdownMenu.Item
											>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				{:else}
					<Table.Row>
						<Table.Cell>
							<div class="flex items-center justify-center">
								<p class="text-gray-500">No torrents found</p>
							</div>
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	{:catch error}
		<div class="flex w-full items-center justify-center">
			<p class="text-red-500">Error: {error.message}</p>
		</div>
	{/await}
</div>
