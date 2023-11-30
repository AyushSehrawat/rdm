<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Rocket, Trash2 } from 'lucide-svelte';
	import type { Writable } from 'svelte/store';

	export let data: any;
	export let filtersObj: any;
	export let filters: Writable<string[]>;
	export let maxResultsPerQuality: Writable<string | number | undefined | null>;
</script>

<div class="flex flex-col md:flex-row md:flex-wrap items-center gap-2">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="w-full md:max-w-max border px-3 py-2 rounded-md text-start text-sm"
			>Exclude Quality Filters</DropdownMenu.Trigger
		>
		<DropdownMenu.Content>
			<DropdownMenu.Group>
				{#each Object.keys(filtersObj) as filter}
					<div class="flex items-center gap-2 py-1">
						<Checkbox
							on:click={() => {
								if ($filters.includes(filter)) {
									let newFilters = $filters.filter((f) => f !== filter);
									filters.set(newFilters);
								} else {
									let newFilters = [...$filters, filter];
									filters.set(newFilters);
								}
							}}
							checked={$filters.includes(filter)}
							id={filter}
							aria-labelledby={filter}
						/>
						<Label id={filter} for={filter}>
							{filtersObj[filter]}
						</Label>
					</div>
				{/each}
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<Select.Root
		onSelectedChange={(selected) => {
			maxResultsPerQuality.set(Number(selected?.value));
		}}
	>
		<Select.Trigger class="w-full md:max-w-max">
			<Select.Value placeholder="Max Results Per Quality" />
		</Select.Trigger>
		<Select.Content>
			{#each [5, 10, 20, 50, 100] as size}
				<Select.Item value={size} label="{size} results">
					{size} results
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	{#if data.props.type === 'movie'}
		<Button
			class="w-full md:max-w-max"
			on:click={() => {
				invalidateAll();
			}}
		>
			<Rocket class="mr-2 w-4 h-4" />
			Apply
		</Button>
	{/if}
	<Button
		class="w-full md:max-w-max"
        variant="destructive"
		on:click={() => {
			filters.set(['480p', 'other', 'scr', 'cam', 'unknown']);
			maxResultsPerQuality.set(undefined);
			invalidateAll();
		}}
	>
		<Trash2 class="mr-2 w-4 h-4" />
		Reset
	</Button>
</div>
