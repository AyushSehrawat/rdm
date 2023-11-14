<script lang="ts">
	import { page } from '$app/stores';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { currentDownloadData } from '$lib/store';
	import { writable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
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
	import { formatDate, debounce, convertBytes } from '$lib/app/helpers.js';
	import { toast } from 'svelte-sonner';
	import Actions from './table-actions.svelte';
	import type { DownloadsType, DownloadsPageDataType } from '$lib/app/types';

	export let data;
	let loading = false;
	$: pageSize = 10;
	let query = $page.url.searchParams.get('query') || '';
	const selectedDownloadIds = writable<string[]>([]);

	$: console.log(query);

	$: totalDownloads = Number(data.downloads?.totalCount);
	$: totalPages = Math.ceil(totalDownloads / pageSize);
	$: currentPage = Number($page.url.searchParams.get('page')) || 1;
	$: hasPreviousPage = currentPage > 1;
	$: hasNextPage = currentPage < totalPages;

	let deletionProgress: number | null | undefined;
	$: maxDeletionProgress = $selectedDownloadIds.length;
	let deletedOneStatus: string;
	let failedOnes: string[] = [];

	$: generatePageNumbers = () => {
		if (totalPages < 1) {
			return [];
		}

		const nearbyPagesCount = 2;

		const startPage = Math.max(1, currentPage - nearbyPagesCount);
		const endPage = Math.min(totalPages, currentPage + nearbyPagesCount);

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

		if (endPage < totalPages - 1) {
			pageNumbers.push('...');
		}

		if (endPage < totalPages) {
			pageNumbers.push(totalPages);
		}

		return pageNumbers;
	};

	let fetchedResults = debounce(async (e) => {
		loading = true;
		query = e.target.value;
		if (query.length === 0) {
			goto(`?limit=${pageSize}&page=1`, { invalidateAll: true });
		}

		goto(`?limit=${pageSize}&page=1&query=${query}`, { invalidateAll: true });
		loading = false;
	});

	async function refreshCurrentPage() {
		loading = true;
		await goto(`?limit=${pageSize}&page=${currentPage}`, { invalidateAll: true });
		loading = false;
	}

	function resetQuery() {
		loading = true;
		query = '';
		goto(`?limit=${pageSize}&page=${currentPage}`, { invalidateAll: true });
		loading = false;
	}

	function setCurrentDataAndRedirect(data: DownloadsType) {
		currentDownloadData.set(data);
		goto(`/app/downloads/${data.id}`);
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

		await invalidateAll();
	};

	let bulkDelete = async function bulkDeleteDownload(ids: string[]) {
		deletedOneStatus = '';
		deletionProgress = 0;
		for (const id of ids) {
			const data = await fetch(`/api/app/downloads/${id}`, {
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
			toast.error(`Failed to delete ${failedOnes.length} / ${ids.length} downloads`);
		} else {
			toast.success(`Success! Deleted ${ids.length} downloads`);
		}

		deletionProgress = null;
		failedOnes = [];
		selectedDownloadIds.set([]);

		await invalidateAll();
	};

	$: resetSelectedDownloadIdsOnPageChange = () => {
		if ($selectedDownloadIds.length === data.downloads?.downloads.length) {
			$selectedDownloadIds = [];
			toast.info('Select all reset on page change. You can change rows per page to avoid this');
		}
	};

	$: selectAllCheck = () => {
		if ($selectedDownloadIds.length === data.downloads?.downloads.length) {
			$selectedDownloadIds = [];
		} else {
			// @ts-ignore
			$selectedDownloadIds = data.downloads?.downloads.map((download) => download.id);
		}
	};

	$: fileCheckedCheck = (download: DownloadsType) => {
		if ($selectedDownloadIds.includes(download.id)) {
			$selectedDownloadIds = $selectedDownloadIds.filter((id) => id !== download.id);
		} else {
			$selectedDownloadIds = [...$selectedDownloadIds, download.id];
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
			placeholder="search for filename"
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
				Results for <span class="font-semibold">{query}</span> | Total {totalDownloads} downloads
			</Table.Caption>
		{:else}
			<Table.Caption
				>On page {currentPage}/{totalPages} | Total {totalDownloads} downloads</Table.Caption
			>
		{/if}
		<Table.Header>
			<Table.Row>
				<Table.Head class="flex items-center gap-2">
					<Checkbox
						on:click={() => {
							selectAllCheck();
						}}
						checked={$selectedDownloadIds.length === data.downloads?.downloads.length}
						id="select-all"
						aria-labelledby="select-all-label"
					/>
					<Label id="select-all-label" for="select-all">Filename</Label>
				</Table.Head>
				<Table.Head>Size</Table.Head>
				<Table.Head>Generated</Table.Head>
				<Table.Head>Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.downloads?.downloads as download (download.id)}
				<Table.Row>
					<Table.Cell class="flex items-center gap-2">
						<Checkbox
							on:click={() => {
								fileCheckedCheck(download);
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
				variant="secondary"
				on:click={() => {
					$selectedDownloadIds = [];
				}}
			>
				Clear
			</Button>
			<Button
				variant="destructive"
				on:click={async () => {
					toast.info(
						`Deleting ${$selectedDownloadIds.length} downloads. Checkout the progress bar below`
					);
					await bulkDelete($selectedDownloadIds);
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
				Deleting {$selectedDownloadIds.length} downloads
			</p>
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
					resetSelectedDownloadIdsOnPageChange();
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
						disabled={!hasPreviousPage}
						on:click={() => {
							resetSelectedDownloadIdsOnPageChange();
							goto(`?limit=${pageSize}&page=1`);
						}}
					>
						<DoubleArrowLeft />
					</Button>
					<Button
						disabled={!hasPreviousPage}
						on:click={() => {
							resetSelectedDownloadIdsOnPageChange();
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
							resetSelectedDownloadIdsOnPageChange();
							goto(`?limit=${pageSize}&page=${currentPage + 1}`);
						}}
					>
						<ArrowRight />
					</Button>
					<Button
						disabled={!hasNextPage}
						on:click={() => {
							resetSelectedDownloadIdsOnPageChange();
							goto(`?limit=${pageSize}&page=${totalPages}`);
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
						variant={currentPage === page ? 'default' : 'secondary'}
						href={`?limit=${pageSize}&page=${page}`}
						on:click={() => {
							resetSelectedDownloadIdsOnPageChange();
						}}
					>
						{page}
					</Button>
				{/if}
			{/each}
		</div>
	{/if}
</div>
