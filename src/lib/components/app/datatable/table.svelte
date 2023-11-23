<script lang="ts">
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { writable, get, type Writable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Select from '$lib/components/ui/select';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import {
		ArrowLeft,
		ArrowRight,
		DoubleArrowLeft,
		DoubleArrowRight,
		Reload,
		Reset
	} from 'radix-icons-svelte';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import {
		formatDate,
		debounce,
		convertBytes,
		capitalizeFirstLetter,
		getFilenameMetadata
	} from '$lib/app/helpers.js';
	import type {
		TorrentsResponse,
		DownloadsResponse,
		ParsedDownloadsResponse,
		ParsedTorrentsResponse
	} from '$lib/app/types';
	import Actions from '$lib/components/app/datatable/table-actions.svelte';
	import Filename from '$lib/components/app/datatable/filename.svelte';
	import { currentDownloadData } from '$lib/store';
	import clsx from 'clsx';

	export let dataType: string;
	export let columns: string[];
	export let pageSize: Writable<number>,
		totalDataItems: Writable<number>,
		totalPages: Writable<number>,
		currentPage: Writable<number>,
		hasPreviousPage: Writable<boolean>,
		hasNextPage: Writable<boolean>;

	let loading: boolean = false;
	let query: string = $page.url.searchParams.get('query') || '';
	const selectedIds: Writable<string[]> = writable<string[]>([]);

	let deletionProgress: number | null | undefined;
	$: maxDeletionProgress = $selectedIds.length as number;
	let deletedOneStatus: string;
	let failedOnes: string[] = [];

	$: generatePageNumbers = (): (number | string)[] => {
		if ($totalPages < 1) {
			return [];
		}

		const nearbyPagesCount = 2;

		const startPage = Math.max(1, get(currentPage) - nearbyPagesCount);
		const endPage = Math.min(get(totalPages), get(currentPage) + nearbyPagesCount);

		let pageNumbers = [];

		if (startPage > 1) {
			pageNumbers.push(1);

			if (startPage > 2) {
				pageNumbers.push('...');
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(i);
		}

		if (endPage < get(totalPages) - 1) {
			pageNumbers.push('...');
		}

		if (endPage < get(totalPages)) {
			pageNumbers.push(get(totalPages));
		}

		return pageNumbers;
	};

	let fetchedResults = debounce(async (e) => {
		loading = true;
		query = e.target.value;
		if (query.length === 0) {
			goto(`?limit=${get(pageSize)}&page=1`, { invalidateAll: true });
		}

		goto(`?limit=${get(pageSize)}&page=1&query=${query}`, { invalidateAll: true });
		loading = false;
	});

	function resetQuery(): void {
		loading = true;
		query = '';
		goto(`?limit=${get(pageSize)}&page=${get(currentPage)}`, { invalidateAll: true });
		loading = false;
	}

	async function refreshCurrentPage(): Promise<void> {
		loading = true;
		await goto(`?limit=${get(pageSize)}&page=${get(currentPage)}`, { invalidateAll: true });
		loading = false;
	}

	let deleteDataItem = async function deleteDataTypeItem(id: string): Promise<void> {
		let url: string;
		if (dataType === 'torrents') {
			url = `/api/app/torrents/${id}`;
		} else if (dataType === 'downloads') {
			url = `/api/app/downloads/${id}`;
		} else {
			return;
		}

		const data = await fetch(url, {
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

	let bulkDelete = async function bulkDeleteDataItems(ids: string[]): Promise<void> {
		let url: string;
		if (dataType === 'torrents') {
			url = `/api/app/torrents`;
		} else if (dataType === 'downloads') {
			url = `/api/app/downloads`;
		} else {
			return;
		}

		deletedOneStatus = '';
		deletionProgress = 0;
		for (const id of ids) {
			const data = await fetch(`${url}/${id}`, {
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
			toast.error(`Failed to delete ${failedOnes.length} / ${ids.length} ${dataType}`);
		} else {
			toast.success(`Success! Deleted ${ids.length} ${dataType}`);
		}

		deletionProgress = null;
		failedOnes = [];
		selectedIds.set([]);

		await invalidateAll();
	};

	$: resetselectedTorrentIdsOnPageChange = (): void => {
		if ($selectedIds.length === $page.data.data?.data.length) {
			selectedIds.set([]);
			toast.info('Select all reset on page change. You can change rows per page to avoid this');
		}
	};

	$: selectAllCheck = (): void => {
		if ($selectedIds.length === $page.data.data?.data.length) {
			selectedIds.set([]);
		} else {
			// @ts-ignore
			selectedIds.set($page.data.data?.data.map((item) => item.id));
		}
	};

	$: fileCheckedCheck = (item: ParsedDownloadsResponse | ParsedTorrentsResponse): void => {
		if ($selectedIds.includes(item.id)) {
			$selectedIds = $selectedIds.filter((id) => id !== item.id);
		} else {
			$selectedIds = [...$selectedIds, item.id];
		}
	};

	function setCurrentDataAndRedirect(item: ParsedDownloadsResponse): void {
		currentDownloadData.set(item);
		goto(`/app/downloads/${item.id}`);
	}
</script>

<div class="p-8 md:px-24 lg:px-32 flex flex-col w-full gap-4">
	<div class="flex items-center w-full justify-between">
		<h2 class="text-2xl font-semibold">{capitalizeFirstLetter(dataType)} <span class="text-muted-foreground text-base">({$totalDataItems})</span></h2>
		<Button
			disabled={loading}
			variant="outline"
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
			placeholder="search id, filename or hash"
			bind:value={query}
			on:input={fetchedResults}
		/>
	</div>
	{#if query.length > 0}
		<p class="text-sm text-muted-foreground">
			Search results for <span class="font-semibold">{$page.url.searchParams.get('query')}</span>
		</p>
	{/if}
	<Table.Root>
		{#if query.length > 0}
			<Table.Caption>
				Results for <span class="font-semibold">{query}</span> | Total {$totalDataItems}
				{dataType}
			</Table.Caption>
		{:else}
			<Table.Caption
				>On page {$currentPage}/{$totalPages} | Total {$totalDataItems} {dataType}</Table.Caption
			>
		{/if}
		<Table.Header>
			<Table.Row
				class={clsx(
					$selectedIds.length === $page.data.data?.data.length && 'bg-primary-foreground'
				)}
			>
				{#each columns as column}
					{#if column === 'filename'}
						<Table.Head class="flex items-center gap-2">
							<Checkbox
								on:click={() => {
									selectAllCheck();
								}}
								checked={$selectedIds.length === $page.data.data?.data.length}
								id="select-all"
								aria-labelledby="select-all-label"
							/>
							<Label id="select-all-label" for="select-all">{capitalizeFirstLetter(column)}</Label>
						</Table.Head>
					{:else if column === 'bytes' || column === 'filesize'}
						<Table.Head>Size</Table.Head>
					{:else}
						<Table.Head>{capitalizeFirstLetter(column)}</Table.Head>
					{/if}
				{/each}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each $page.data.data?.data as item (item.id)}
				<Table.Row class={clsx($selectedIds.includes(item.id) && 'bg-primary-foreground')}>
					{#each columns as column}
						{#if column === 'filename'}
							<Table.Cell class="flex items-start gap-2">
								<Checkbox
									on:click={() => {
										fileCheckedCheck(item);
									}}
									checked={$selectedIds.includes(item.id)}
									id={item.id}
									aria-labelledby="{item.id}-label"
								/>
								<Label class="flex flex-col gap-1" id="{item.id}-label" for={item.id}>
									<Filename filedata={item} />
								</Label>
							</Table.Cell>
						{:else if column === 'bytes'}
							<Table.Cell>{convertBytes(item.bytes)}</Table.Cell>
						{:else if column === 'added'}
							<Table.Cell>{formatDate(item.added)}</Table.Cell>
						{:else if column === 'status'}
							<Table.Cell>{capitalizeFirstLetter(item.status)}</Table.Cell>
						{:else if column === 'filesize'}
							<Table.Cell>{convertBytes(item.filesize)}</Table.Cell>
						{:else if column === 'generated'}
							<Table.Cell>{formatDate(item.generated)}</Table.Cell>
						{:else if column === 'actions'}
							<Table.Cell>
								<Actions {dataType} {item} {deleteDataItem} {setCurrentDataAndRedirect} />
							</Table.Cell>
						{:else}
							<Table.Cell>{item[column]}</Table.Cell>
						{/if}
					{/each}
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>

	<p class="text-sm text-muted-foreground">
		Selected {$selectedIds.length} items
	</p>

	{#if $selectedIds.length > 0}
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				on:click={() => {
					selectedIds.set([]);
				}}
			>
				Clear
			</Button>
			<Button
				variant="destructive"
				on:click={async () => {
					toast.info(
						`Deleting ${$selectedIds.length} ${dataType}. Checkout the progress bar below`
					);
					await bulkDelete($selectedIds);
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
				Deleting {$selectedIds.length}
				{dataType}
			</p>
		</div>
	{/if}

	{#if query.length === 0}
		<p class="text-sm text-muted-foreground mt-4">
			Showing {$page.data.data?.data.length} of {$totalDataItems}
			{dataType}
		</p>
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
			<Select.Root
				onSelectedChange={(selected) => {
					pageSize.set(Number(selected?.value));
					resetselectedTorrentIdsOnPageChange();
					goto(`?limit=${selected?.value}&page=1`, { invalidateAll: true });
				}}
				selected={{
					value: $pageSize,
					label: String($pageSize)
				}}
			>
				<Select.Trigger class="w-[180px]">
					<Select.Value placeholder="Rows per page" />
				</Select.Trigger>
				<Select.Content>
					{#each [5, 10, 25, 50, 100, 500, 1000, 2500] as size}
						<Select.Item value={size} label={String(size)}>
							{size}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<div class="flex items-center justify-between md:justify-normal md:gap-4">
				<div class="flex items-center gap-2">
					<Button
						disabled={!$hasPreviousPage}
						on:click={() => {
							resetselectedTorrentIdsOnPageChange();
							goto(`?limit=${$pageSize}&page=1`);
						}}
					>
						<DoubleArrowLeft />
					</Button>
					<Button
						disabled={!$hasPreviousPage}
						on:click={() => {
							resetselectedTorrentIdsOnPageChange();
							goto(`?limit=${$pageSize}&page=${$currentPage - 1}`);
						}}
					>
						<ArrowLeft />
					</Button>
				</div>
				<div class="flex items-center gap-2">
					<Button
						disabled={!$hasNextPage}
						on:click={() => {
							resetselectedTorrentIdsOnPageChange();
							goto(`?limit=${$pageSize}&page=${$currentPage + 1}`);
						}}
					>
						<ArrowRight />
					</Button>
					<Button
						disabled={!$hasNextPage}
						on:click={() => {
							resetselectedTorrentIdsOnPageChange();
							goto(`?limit=${$pageSize}&page=${$totalPages}`);
						}}
					>
						<DoubleArrowRight />
					</Button>
				</div>
			</div>
		</div>

		<div class="flex flex-wrap items-center w-full justify-center">
			{#each generatePageNumbers() as page}
				{#if page === '...'}
					<span class="m-1">...</span>
				{:else}
					<Button
						class="m-1"
						variant={$currentPage === page ? 'default' : 'secondary'}
						href={`?limit=${$pageSize}&page=${page}`}
						on:click={() => {
							resetselectedTorrentIdsOnPageChange();
						}}
					>
						{page}
					</Button>
				{/if}
			{/each}
		</div>
	{/if}
</div>
