<script lang="ts">
	import { page } from '$app/stores';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { writable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Select from '$lib/components/ui/select';
	import { Progress } from '$lib/components/ui/progress';
	import {
		ArrowLeft,
		ArrowRight,
		DoubleArrowLeft,
		DoubleArrowRight,
		Reload,
		Reset
	} from 'radix-icons-svelte';
	import { Loader2 } from 'lucide-svelte';
	import { formatDate, debounce, convertBytes, capitalizeFirstLetter } from '$lib/app/helpers.js';
	import { toast } from 'svelte-sonner';
	import Actions from './table-actions.svelte';

	export let data;
	let loading = false;
	$: pageSize = 10;
	let query = $page.url.searchParams.get('query') || '';
	const selectedTorrentIds = writable<string[]>([]);

	$: totalTorrents = Number(data.torrents?.totalCount);
	$: totalPages = Math.ceil(totalTorrents / pageSize);
	$: currentPage = Number($page.url.searchParams.get('page')) || 1;
	$: hasPreviousPage = currentPage > 1;
	$: hasNextPage = currentPage < totalPages;

	let deletionProgress: number | null | undefined;
	$: maxDeletionProgress = $selectedTorrentIds.length;
	let deletedOneStatus: string;
	let failedOnes: string[] = [];

	let fetchedResults = debounce(async (e) => {
		query = e.target.value;
		if (query.length === 0) {
			goto(`?limit=${pageSize}&page=1`, { invalidateAll: true });
		}

		goto(`?limit=${pageSize}&page=1&query=${query}`, { invalidateAll: true });
	});

	async function refreshCurrentPage() {
		loading = true;
		await goto(`?limit=${pageSize}&page=${currentPage}`, { invalidateAll: true });
		loading = false;
	}

	function resetQuery() {
		query = '';
		goto(`?limit=${pageSize}&page=${currentPage}`, { invalidateAll: true });
	}

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

		await invalidateAll();
	};

	let bulkDelete = async function bulkDeleteTorrent(ids: string[]) {
		deletedOneStatus = '';
		deletionProgress = 0;
		for (const id of ids) {
			const data = await fetch(`/api/app/torrents/${id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let resp = await data.json();
			if (resp.success === true) {
				deletedOneStatus = `Deleted ${id}`;
			} else if (resp.success === false) {
				failedOnes.push(id);
			}

			deletionProgress++;
			await new Promise((resolve) => setTimeout(resolve, 200));
		}

		if (failedOnes.length > 0) {
			toast.error(`Failed to delete ${failedOnes.length} torrents`);
		} else {
			toast.success(`Success! Deleted ${ids.length} torrents`);
		}

		deletionProgress = null;
		failedOnes = [];
		selectedTorrentIds.set([]);

		await invalidateAll();
	};

	$: resetselectedTorrentIdsOnPageChange = () => {
		if ($selectedTorrentIds.length === data.torrents?.torrents.length) {
			$selectedTorrentIds = [];
			toast.info('Select all reset on page change. You can change rows per page to avoid this');
		}
	};
</script>

<div class="p-8 md:px-24 lg:px-32 flex flex-col w-full gap-4">
	<div class="flex items-center w-full justify-between">
		<h2 class="text-2xl font-semibold">Torrents</h2>
		<Button
			disabled={loading}
			on:click={async () => {
				await refreshCurrentPage();
			}}
		>
			{#if loading}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<Reload class="mr-2 h-4 w-4" />
			{/if}
			Refresh
		</Button>
	</div>
	<div class="flex flex-col w-full gap-1.5">
		<div class="flex items-center w-full justify-between">
			<Label for="query">Search</Label>
			{#if query.length > 0}
				<Button variant="secondary" on:click={resetQuery}>
					<Reset class="mr-2 h-4 w-4" />
					Reset
				</Button>
			{/if}
		</div>
		<Input
			type="text"
			id="query"
			placeholder="something here"
			bind:value={query}
			on:input={fetchedResults}
		/>
	</div>
	{#if query.length > 0}
		<p class="text-sm text-muted-foreground">
			Search results for <span class="font-semibold">{query}</span>
		</p>
	{/if}
	<Table.Root>
		{#if query.length > 0}
			<Table.Caption>
				Results for <span class="font-semibold">{query}</span> | Total {totalTorrents} torrents
			</Table.Caption>
		{:else}
			<Table.Caption
				>On page {currentPage}/{totalPages} | Total {totalTorrents} torrents</Table.Caption
			>
		{/if}
		<Table.Header>
			<Table.Row>
				<Table.Head class="flex items-center gap-2">
					<Checkbox
						on:click={() => {
							if ($selectedTorrentIds.length === data.torrents?.torrents.length) {
								$selectedTorrentIds = [];
							} else {
								// @ts-ignore
								$selectedTorrentIds = data.torrents?.torrents.map((torrent) => torrent.id);
							}
						}}
						checked={$selectedTorrentIds.length === data.torrents?.torrents.length}
						id="select-all"
						aria-labelledby="select-all-label"
					/>
					<Label id="select-all-label" for="select-all">Filename</Label>
				</Table.Head>
				<Table.Head>Size</Table.Head>
				<Table.Head>Added</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head>Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.torrents?.torrents as torrent}
				<Table.Row>
					<Table.Cell class="flex items-center gap-2">
						<Checkbox
							on:click={() => {
								if ($selectedTorrentIds.includes(torrent.id)) {
									$selectedTorrentIds = $selectedTorrentIds.filter((id) => id !== torrent.id);
								} else {
									$selectedTorrentIds = [...$selectedTorrentIds, torrent.id];
								}
							}}
							checked={$selectedTorrentIds.includes(torrent.id)}
							id={torrent.id}
							aria-labelledby="torrent-label"
						/>
						<Label id="torrent-label" for={torrent.id}>
							{torrent.filename}
						</Label>
					</Table.Cell>
					<Table.Cell>{convertBytes(torrent.bytes)}</Table.Cell>
					<Table.Cell>{formatDate(torrent.added)}</Table.Cell>
					<Table.Cell>{capitalizeFirstLetter(torrent.status)}</Table.Cell>
					<Table.Cell>
						<Actions torrentData={torrent} {deleteTorrent} id={torrent.id} />
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>

	<p class="text-sm text-muted-foreground">
		Selected {$selectedTorrentIds.length} items
	</p>

	{#if $selectedTorrentIds.length > 0}
		<div class="flex items-center gap-2">
			<Button
				on:click={() => {
					$selectedTorrentIds = [];
				}}
			>
				Clear
			</Button>
			<Button
				on:click={async () => {
					toast.info(
						`Deleting ${$selectedTorrentIds.length} torrents. Checkout the progress bar below`
					);
					await bulkDelete($selectedTorrentIds);
				}}>Delete</Button
			>
		</div>
	{/if}

	{#if deletionProgress}
		<div class="flex flex-col my-4 gap-2">
			<p class="text-sm text-muted-foreground">
				{deletedOneStatus}
			</p>
			<Progress value={deletionProgress} max={maxDeletionProgress} />
			<p class="text-sm text-muted-foreground">
				Deleting {$selectedTorrentIds.length} torrents
			</p>
		</div>
	{/if}

	{#if query.length === 0}
		<p class="text-sm text-muted-foreground mt-4">
			Showing {data.torrents?.torrents.length} of {totalTorrents} torrents
		</p>
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
			<Select.Root
				onSelectedChange={(selected) => {
					pageSize = Number(selected?.value);
					resetselectedTorrentIdsOnPageChange();
					goto(`?limit=${selected?.value}&page=1`, { invalidateAll: true });
				}}
				selected={{
					value: pageSize,
					label: String(pageSize)
				}}
			>
				<Select.Trigger class="w-[180px]">
					<Select.Value placeholder="Rows per page" />
				</Select.Trigger>
				<Select.Content>
					{#each [10, 25, 50, 100, 500, 1000, 2500] as size}
						<Select.Item value={size} label={String(size)}>
							{size}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<div class="flex items-center justify-between md:justify-normal md:gap-4">
				<div class="flex items-center gap-2">
					<Button
						disabled={!hasPreviousPage}
						on:click={() => {
							resetselectedTorrentIdsOnPageChange();
							goto(`?limit=${pageSize}&page=1`);
						}}
					>
						<DoubleArrowLeft />
					</Button>
					<Button
						disabled={!hasPreviousPage}
						on:click={() => {
							resetselectedTorrentIdsOnPageChange();
							goto(`?limit=${pageSize}&page=${currentPage - 1}`);
						}}
					>
						<ArrowLeft />
					</Button>
				</div>
				<div class="flex items-center gap-2">
					<Button
						disabled={!hasNextPage}
						on:click={() => {
							resetselectedTorrentIdsOnPageChange();
							goto(`?limit=${pageSize}&page=${currentPage + 1}`);
						}}
					>
						<ArrowRight />
					</Button>
					<Button
						disabled={!hasNextPage}
						on:click={() => {
							resetselectedTorrentIdsOnPageChange();
							goto(`?limit=${pageSize}&page=${totalPages}`);
						}}
					>
						<DoubleArrowRight />
					</Button>
				</div>
			</div>
		</div>

		<div class="flex flex-wrap items-center w-full justify-center">
			{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
				<Button
					class="m-1"
					variant={currentPage === page ? 'default' : 'secondary'}
					href={`?limit=${pageSize}&page=${page}`}
					on:click={() => {
						resetselectedTorrentIdsOnPageChange();
					}}
				>
					{page}
				</Button>
			{/each}
		</div>
	{/if}
</div>
