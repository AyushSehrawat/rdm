<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { DotsHorizontal } from 'radix-icons-svelte';
	import { toast } from 'svelte-sonner';

	export let link: string;

	let unrestrictLink = async function unrestrictLinkData(link: string) {
		const data = await fetch(`/api/app/unrestrict`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ link })
		});
		let resp = await data.json();
		if (resp.success === true) {
			toast.success(`Success!. Copied link to clipboard`);
		} else if (resp.success === false) {
			toast.error(`Error! ${resp.error}`);
		}
		return resp.data.download;
	};
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
					navigator.clipboard.writeText(link);
					toast.success('Copied link to clipboard');
				}}>Copy Restricted Link</DropdownMenu.Item
			>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			on:click={async () => {
				navigator.clipboard.writeText(await unrestrictLink(link));
			}}>Unrestrict & Copy Link</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
