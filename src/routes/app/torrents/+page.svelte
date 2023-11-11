<script lang="ts">
	import { page } from '$app/stores';
	import { goto, invalidate } from '$app/navigation';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import {
		ArrowLeft,
		ArrowRight,
		DoubleArrowLeft,
		DoubleArrowRight,
		Reload,
		Reset
	} from 'radix-icons-svelte';
	import { Loader2 } from 'lucide-svelte';
	import {
		formatDate,
		debounce,
		convertBytes,
		showToast,
		capitalizeFirstLetter
	} from '$lib/app/helpers.js';
	import Actions from './table-actions.svelte';

	export let data;
	let loading = false;
	let pageSize = 10;
	let query = $page.url.searchParams.get('query') || '';

	$: totalTorrents = Number(data.torrents?.totalCount);
	$: totalPages = Math.ceil(totalTorrents / pageSize);
	$: currentPage = Number($page.url.searchParams.get('page')) || 1;
	$: hasPreviousPage = currentPage > 1;
	$: hasNextPage = currentPage < totalPages;

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

	let deleteTorrent = async function deleteTorrentData(ids: string[]) {
		const data = await fetch('/api/app/torrents', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ ids })
		});

		let resp = await data.json();
		if (resp.success === true) {
			showToast(`Success! ${resp.message}`, 'success');
		} else if (resp.success === false) {
			showToast(`Error! ${resp.error}`, 'error');
		}

		await invalidate(`/api/app/torrents?limit=${pageSize}&page=${currentPage}`);
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
				<Table.Head>Filename</Table.Head>
				<Table.Head>Size</Table.Head>
				<Table.Head>Added</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head>Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.torrents?.torrents as torrent, i}
				<Table.Row>
					<Table.Cell>{torrent.filename}</Table.Cell>
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

	{#if query.length === 0}
		<Select.Root
			onSelectedChange={(selected) => {
				pageSize = Number(selected?.value);
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
		<div class="flex items-center justify-between w-full">
			<div class="flex items-center gap-2">
				<Button
					disabled={!hasPreviousPage}
					on:click={() => {
						goto(`?limit=${pageSize}&page=1`);
					}}
				>
					<DoubleArrowLeft />
				</Button>
				<Button
					disabled={!hasPreviousPage}
					on:click={() => {
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
						goto(`?limit=${pageSize}&page=${currentPage + 1}`);
					}}
				>
					<ArrowRight />
				</Button>
				<Button
					disabled={!hasNextPage}
					on:click={() => {
						goto(`?limit=${pageSize}&page=${totalPages}`);
					}}
				>
					<DoubleArrowRight />
				</Button>
			</div>
		</div>

		<div class="flex flex-wrap items-center w-full justify-center">
			{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
				<Button
					class="m-1"
					variant={currentPage === page ? 'default' : 'secondary'}
					href={`?limit=${pageSize}&page=${page}`}
				>
					{page}
				</Button>
			{/each}
		</div>
	{/if}
</div>
