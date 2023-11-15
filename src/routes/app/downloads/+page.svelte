<script lang="ts">
	import { get, writable } from 'svelte/store';
	import { page } from '$app/stores';
	import DataTable from '$lib/components/app/datatable/table.svelte';

	const dataType = 'downloads';
	const columns = ['filename', 'filesize', 'generated', 'actions'];

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
