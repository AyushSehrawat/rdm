<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { DotsHorizontal } from 'radix-icons-svelte';
	import type { TorrentsResponse, DownloadsResponse } from '$lib/app/types';

	export let dataType: string;
	export let item: any;
	export let deleteDataItem: (id: string) => void;
	export let setCurrentDataAndRedirect: (item: DownloadsResponse) => void;
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
					navigator.clipboard.writeText(item.id);
					toast.success('Copied ID to clipboard');
				}}
			>
				Copy ID
			</DropdownMenu.Item>
			{#if dataType === 'downloads'}
				<DropdownMenu.Item
					on:click={() => {
						navigator.clipboard.writeText(item.download);
						toast.success('Download link copied to clipboard!');
					}}
				>
					Copy Download Link
				</DropdownMenu.Item>
			{:else}
				<DropdownMenu.Item
					on:click={() => {
						navigator.clipboard.writeText(`magnet:?xt=urn:btih:${item.hash}`);
						toast.success('Copied magnet url to clipboard');
					}}
				>
					Copy magnet url
				</DropdownMenu.Item>
				<DropdownMenu.Item
					on:click={() => {
						navigator.clipboard.writeText(item.hash);
						toast.success('Copied hash to clipboard');
					}}
				>
					Copy hash
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			on:click={() => {
				if (dataType === 'downloads') {
					setCurrentDataAndRedirect(item);
				} else {
					goto(`/app/torrents/${item.id}`);
				}
			}}>Details</DropdownMenu.Item
		>
		<DropdownMenu.Item
			on:click={() => {
				deleteDataItem(item.id);
			}}>Delete</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
