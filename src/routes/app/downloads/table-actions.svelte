<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { DotsHorizontal } from 'radix-icons-svelte';
	import { toast } from 'svelte-sonner';
	import type { DownloadsType } from '$lib/app/types';

	export let downloadData: DownloadsType;
	export let deleteDownload: (ids: string[]) => void;
	export let setCurrentDataAndRedirect: (data: DownloadsType) => void;
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
			<DropdownMenu.Item
				on:click={() => {
					navigator.clipboard.writeText(downloadData.download);
				}}
			>
				Copy Download Link
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			on:click={() => {
				setCurrentDataAndRedirect(downloadData);
			}}>Details</DropdownMenu.Item
		>
		<DropdownMenu.Item
			on:click={() => {
				deleteDownload([downloadData.id]);
			}}>Delete</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
