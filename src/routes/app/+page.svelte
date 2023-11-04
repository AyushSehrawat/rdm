<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { RotateCw, Loader2 } from 'lucide-svelte';
	import { DotsHorizontal } from 'radix-icons-svelte';
	import { goto } from '$app/navigation';
	import { formatDate, convertBytes, capitalizeFirstLetter } from '$lib/app/helpers';
	import { toast } from '@zerodevx/svelte-toast';
	import { currentDownloadData } from '$lib/store';

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

	let downloadRefresh = false;
	let torrentRefresh = false;

	let recentDownloads = async function recentDownloadsData() {
		const data = await fetch(`/api/app/downloads?type=recent`);
		downloadRefresh = false;
		return data.json();
	};
	let doRecentDownloads = recentDownloads();
	function refreshRecentDownloads() {
		downloadRefresh = true;
		doRecentDownloads = recentDownloads();
	}

	let recentTorrents = async function recentTorrentsData() {
		const data = await fetch(`/api/app/torrents?type=recent`);
		torrentRefresh = false;
		return data.json();
	};
	let doRecentTorrents = recentTorrents();
	function refreshRecentTorrents() {
		torrentRefresh = true;
		doRecentTorrents = recentTorrents();
	}

	let deleteDownload = async function deleteDownloadData(ids: string[]) {
		const data = await fetch(`/api/app/downloads`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ ids })
		});
		let resp = await data.json();
		if (resp.success === true) {
			toast.push(`Success! ${resp.message}`, {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,1)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} else if (resp.success === false) {
			toast.push(`Error! ${resp.error}`, {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(220,38,38,1)',
					'--toastBarBackground': '#C53030'
				}
			});
		}
		doRecentDownloads = recentDownloads();
	};

	let deleteTorrent = async function deleteTorrentData(ids: string[]) {
		const data = await fetch(`/api/app/torrents`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ ids })
		});
		let resp = await data.json();
		if (resp.success === true) {
			toast.push(`Success! ${resp.message}`, {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,1)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} else if (resp.success === false) {
			toast.push(`Error! ${resp.error}`, {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(220,38,38,1)',
					'--toastBarBackground': '#C53030'
				}
			});
		}
		doRecentTorrents = recentTorrents();
	};

	function setCurrentDataAndRedirect(data: DownloadsType) {
		currentDownloadData.set(data);
		goto(`/app/downloads/${data.id}`);
	}
</script>

<div class="p-8 md:px-24 lg:px-32 flex flex-col">
	<div class="flex items-center justify-between mt-8">
		<h3 class="font-semibold">Recent Downloads</h3>
		<Button disabled={downloadRefresh} on:click={refreshRecentDownloads}>
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
	{:then $data}
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
				{#each $data as download}
					<Table.Row>
						<Table.Cell>{download.filename}</Table.Cell>
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
												navigator.clipboard.writeText(download.download);
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
												deleteDownload([download.id]);
											}}>Delete</DropdownMenu.Item
										>
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{:catch error}
		<div class="flex w-full items-center justify-center">
			<p class="text-red-500">Error: {error.message}</p>
		</div>
	{/await}

	<div class="flex items-center justify-between mt-8">
		<h3 class="font-semibold">Recent Torrents</h3>
		<Button disabled={torrentRefresh} on:click={refreshRecentTorrents}>
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
	{:then $data}
		<Table.Root class="my-2 mb-8">
			<Table.Caption>Your last 5 Downloads</Table.Caption>
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
				{#each $data as torrent, i}
					<Table.Row>
						<Table.Cell>{torrent.filename}</Table.Cell>
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
											}}>Copy ID</DropdownMenu.Item
										>
										<DropdownMenu.Separator />
										<DropdownMenu.Item
											on:click={() => {
												goto(`/app/torrents/${torrent.id}`);
											}}>Details</DropdownMenu.Item
										>
										<DropdownMenu.Item
											on:click={() => {
												deleteTorrent([torrent.id]);
											}}>Delete</DropdownMenu.Item
										>
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{:catch error}
		<div class="flex w-full items-center justify-center">
			<p class="text-red-500">Error: {error.message}</p>
		</div>
	{/await}
</div>
