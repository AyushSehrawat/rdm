<script lang="ts">
	import { invalidate } from '$app/navigation';
	import DataTable from './data-table.svelte';
	import { Button } from '$lib/components/ui/button';
	import { RotateCw, Loader2 } from 'lucide-svelte';

	export let data;
	$: allTorrents = data.allTorrents;

	let loading = false;

	async function refresh() {
		loading = true;
		await invalidate((url) => url.pathname === '/api/app/torrents');
		loading = false;
	}
</script>

<div class="flex flex-col p-8 md:px-24 lg:px-32 w-full">
	<div class="flex items-center justify-between py-4">
		<h2 class="text-2xl font-semibold">Torrents</h2>
		<Button disabled={loading} on:click={refresh}>
			{#if loading}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<RotateCw class="mr-2 h-4 w-4" />
			{/if}
			Refresh
		</Button>
	</div>
	{#key allTorrents}
		<DataTable {allTorrents} />
	{/key}
</div>
