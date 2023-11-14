<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import type { Writable } from 'svelte/store';
	import clsx from 'clsx';

	export let limit: Writable<number>;
	export let torrentIoData: any;
	export let getTitle: (streams: any[]) => string;
	export let type: string;
</script>

<div
	class:flex-col={type === 'series'}
	class:flex-row={type === 'movie'}
	class:flex-wrap={type === 'movie'}
	class="flex gap-2"
>
	<Button
		class={clsx({ 'w-full': type === 'series' }, { 'w-full max-w-max': type === 'movie' })}
		disabled={$limit >= torrentIoData.streams.length}
		on:click={() => {
			limit.update((v) => v + 10);
		}}>Show more</Button
	>
	<Button
		disabled={$limit <= 10}
		class={clsx({ 'w-full': type === 'series' }, { 'w-full max-w-max': type === 'movie' })}
		on:click={() => {
			limit.update((v) => 10);
		}}>Show less</Button
	>
	<Button
		class={clsx({ 'w-full': type === 'series' }, { 'w-full max-w-max': type === 'movie' })}
		disabled={$limit >= torrentIoData.streams.length}
		on:click={() => {
			limit.set(torrentIoData.streams.length);
		}}>Show all</Button
	>
	<Button
		class={clsx({ 'w-full': type === 'series' }, { 'w-full max-w-max': type === 'movie' })}
		on:click={async () => {
			await navigator.clipboard.writeText(getTitle(torrentIoData.streams));
			toast.success('Copied to clipboard');
			window.open('https://regex101.com/', '_blank');
		}}>Copy titles and goto regex101</Button
	>
</div>
