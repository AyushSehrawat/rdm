<script lang="ts">
	import { Copy, PlusSquare } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { toast } from 'svelte-sonner';

	export let url: string;
	export let addToRD: (url: string) => void;
</script>

<div class="flex items-center gap-2">
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<Button
				variant="secondary"
				builders={[builder]}
				on:click={() => {
					navigator.clipboard.writeText(url);
					toast.success('Copied to clipboard');
				}}
			>
				<Copy class="w-4 h-4" />
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Copy download link</p>
		</Tooltip.Content>
	</Tooltip.Root>
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<Button
				variant="secondary"
				builders={[builder]}
				on:click={() => {
					addToRD(url);
					toast.success('Added to RD');
				}}
			>
				<PlusSquare class="w-4 h-4" />
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Add torrent and this single download</p>
		</Tooltip.Content>
	</Tooltip.Root>
</div>
