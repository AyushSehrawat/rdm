<script lang="ts">
	import { get, writable } from 'svelte/store';
	import { page } from '$app/stores';
	import DataTable from '$lib/components/app/datatable/table.svelte';

	const dataType = 'torrents';
	const columns = ['filename', 'bytes', 'added', 'status', 'actions'];

	$: pageSize = writable(Number($page.url.searchParams.get('limit') || 10));
	$: totalDataItems = writable(Number($page.data.items?.totalCount));
	$: totalPages = writable(Math.ceil(get(totalDataItems) / get(pageSize)));
	$: currentPage = writable(Number($page.url.searchParams.get('page') || 1));
	$: hasPreviousPage = writable(get(currentPage) > 1);
	$: hasNextPage = writable(get(currentPage) < get(totalPages));

	$: console.log({
		dataType,
		columns,
		$pageSize,
		$totalDataItems,
		$totalPages,
		$currentPage,
		$hasPreviousPage,
		$hasNextPage
	});
</script>

{#if $page.data.items.items}
	<DataTable
		{dataType}
		{columns}
		{pageSize}
		{totalDataItems}
		{totalPages}
		{currentPage}
		{hasPreviousPage}
		{hasNextPage}
	/>
{:else}
	<div class="p-8 md:px-24 lg:px-32">
		<div class="flex flex-col items-center justify-center">
			<h1 class="text-3xl font-semibold text-gray-800 dark:text-gray-100">No {dataType} found!</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-2">There are no {dataType} to display.</p>
		</div>
	</div>
{/if}
