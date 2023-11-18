<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	// TODO: add types
	export let file: any;

	let selected: Writable<string[]> = getContext('selected');
</script>

<div class="flex flex-col gap-1 p-1">
	{#if file.file}
		<div class="flex gap-2">
			<Checkbox
				on:click={() => {
					if ($selected.includes(file.file.id)) {
						selected.update((lst) => lst.filter((item) => item !== file.file.id));
					} else {
						selected.update((lst) => [...lst, file.file.id]);
					}
				}}
				id={file.file.id}
				checked={$selected.includes(file.file.id)}
				aria-labelledby={file.path}
			/>
			<Label id={file.path} for={file.file.id} class="text-sm">
				{file.path}
			</Label>
		</div>
	{:else}
		<!--Means it's a folder-->
		<!--TODO: make folder a checkbox-->
		<p class="font-semibold text-base">{file.path}</p>
		{#if file.children && file.children.length > 0}
			<ul class="ml-4">
				{#each file.children as childFile}
					<svelte:self file={childFile} />
				{/each}
			</ul>
		{/if}
	{/if}
</div>
