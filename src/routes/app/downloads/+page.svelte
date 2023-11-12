<script lang="ts">
	import { page } from '$app/stores';
	import { goto, invalidate } from '$app/navigation';
	import { currentDownloadData } from '$lib/store';
	import { writable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		ArrowLeft,
		ArrowRight,
		DoubleArrowLeft,
		DoubleArrowRight,
		Reload,
		Reset
	} from 'radix-icons-svelte';
	import { Loader2 } from 'lucide-svelte';
	import { formatDate, debounce, convertBytes } from '$lib/app/helpers.js';
	import { toast } from 'svelte-sonner';
	import Actions from './table-actions.svelte';
	import type { DownloadsType } from '$lib/app/types';

	export let data;
	let loading = false;
	$: pageSize = 10;
	let query = $page.url.searchParams.get('query') || '';
	const selectedDownloadIds = writable<string[]>([]);

	$: totalDownloads = Number(data.downloads?.totalCount);
	$: totalPages = Math.ceil(totalDownloads / pageSize);
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

	function setCurrentDataAndRedirect(data: DownloadsType) {
		currentDownloadData.set(data);
		goto(`/app/downloads/${data.id}`);
	}

	let deleteDownload = async function deleteDownloadData(ids: string[]) {
		const data = await fetch('/api/app/downloads', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ ids })
		});

		let resp = await data.json();
		if (resp.success === true) {
			toast.success(`Success! ${resp.message}`);
		} else if (resp.success === false) {
			toast.error(`Error! ${resp.error}`);
		} else if (resp.success === 'partial') {
			toast.warning(`Partial success! ${resp.message}. Failed: ${resp.failures}`);
		}

		if (query.length > 0) {
			await invalidate(`/api/app/downloads?limit=${pageSize}&page=1&query=${query}`);
		} else {
			await invalidate(`/api/app/downloads?limit=${pageSize}&page=${currentPage}`);
		}
	};
</script>

<div class="p-8 md:px-24 lg:px-32 flex flex-col w-full gap-4">
	<div class="flex items-center w-full justify-between">
		<h2 class="text-2xl font-semibold">Downloads</h2>
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
				Results for <span class="font-semibold">{query}</span> | Total {totalDownloads} downloads
			</Table.Caption>
		{:else}
			<Table.Caption
				>On page {currentPage}/{totalPages} | Total {totalDownloads} downloads</Table.Caption
			>
		{/if}
		<Table.Header>
			<Table.Row>
				<Table.Head>Filename</Table.Head>
				<Table.Head>Size</Table.Head>
				<Table.Head>Generated</Table.Head>
				<Table.Head>Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.downloads?.downloads as download}
				<Table.Row>
					<Table.Cell class="flex items-center gap-2">
						<Checkbox
							on:click={() => {
								if ($selectedDownloadIds.includes(download.id)) {
									$selectedDownloadIds = $selectedDownloadIds.filter((id) => id !== download.id);
								} else {
									$selectedDownloadIds = [...$selectedDownloadIds, download.id];
								}
							}}
							checked={$selectedDownloadIds.includes(download.id)}
							id={download.id}
							aria-labelledby="download-label"
						/>
						<Label id="download-label" for={download.id}>
							{download.filename}
						</Label>
					</Table.Cell>
					<Table.Cell>{convertBytes(download.filesize)}</Table.Cell>
					<Table.Cell>{formatDate(download.generated)}</Table.Cell>
					<Table.Cell>
						<Actions downloadData={download} {deleteDownload} {setCurrentDataAndRedirect} />
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>

	<p class="text-sm text-muted-foreground">
		Selected {$selectedDownloadIds.length} items
	</p>

	{#if $selectedDownloadIds.length > 0}
		<div class="flex items-center gap-2">
			<Button
				on:click={() => {
					$selectedDownloadIds = [];
				}}
			>
				Clear
			</Button>
			<Button
				on:click={() => {
					deleteDownload($selectedDownloadIds);
					$selectedDownloadIds = [];
				}}
			>
				Delete
			</Button>
		</div>
	{/if}

	{#if query.length === 0}
		<p class="text-sm text-muted-foreground mt-4">
			Showing {data.downloads?.downloads.length} of {totalDownloads} downloads
		</p>
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
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
			<div class="flex items-center justify-between md:justify-normal md:gap-4">
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
