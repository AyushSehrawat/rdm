<script lang="ts">
	import { LogOut } from 'lucide-svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as Tooltip from '$lib/components/ui/tooltip';

	async function logout() {
		const res = await fetch('/api/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		goto('/', { invalidateAll: true });
	}
</script>

<AlertDialog.Root>
	<Tooltip.Root>
		<Tooltip.Trigger>
			<AlertDialog.Trigger asChild let:builder>
				<Button builders={[builder]} size="icon" variant="outline">
					<LogOut class="h-[1.2rem] w-[1.2rem]" />
				</Button>
			</AlertDialog.Trigger>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Add to library</p>
		</Tooltip.Content>
	</Tooltip.Root>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will clear all the cookies and local storage.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				class="font-bold"
				on:click={async () => {
					await logout();
				}}>Continue</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
