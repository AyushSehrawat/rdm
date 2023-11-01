<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { DotsHorizontal } from 'radix-icons-svelte';
	import { goto } from '$app/navigation';

	export let id: string;
	export let download: string;
	export let deleteDownload: (ids: string[]) => void;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} class="w-8 h-8 p- relative">
			<span class="sr-only">Open menu</span>
			<DotsHorizontal class="w-4 h-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item on:click={() => navigator.clipboard.writeText(download)}>
				Copy Download Link
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item disabled>Details (Soon)</DropdownMenu.Item>
		<DropdownMenu.Item
			on:click={() => {
				deleteDownload([id]);
			}}>Delete</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
