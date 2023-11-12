<script lang="ts">
	import { currentDownloadData } from '$lib/store';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Trash, Copy, ClipboardCheck, Play } from 'lucide-svelte';
	import { formatDate, convertBytes, isStreamable } from '$lib/app/helpers';
	import { goto, afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import type { DownloadsType } from '$lib/app/types';

	let previousPage: string = base;

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
	});

	let isIDCopied = false;
	let isDownloadLinkCopied = false;

	let deleteDownload = async function deleteDownloadData(ids: string[]) {
		const data = await fetch(`/api/app/downloads`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ ids })
		});
		let resp = await data.json();
		if (resp.success === true) {
			toast.success(`Success! ${resp.message}`);
		} else if (resp.success === false) {
			toast.error(`Error! ${resp.error}`);
		}

		goto(previousPage);
	};
</script>

<div class="flex flex-col p-8 md:px-24 lg:px-32 gap-4 w-full">
	{#if $currentDownloadData === undefined}
		<h2 class="text-xl font-semibold">Error!</h2>
		<p>Seems like you opened the link directly or you have reloaded the page.</p>
		<p>
			Make sure you open details page only by clicking the "Details" from actions menu. It's
			implemented this way to save on requests as there is no direct way to get info for a single
			download on RD API.
		</p>
	{:else}
		<div class="flex flex-col w-full">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-start break-words">{$currentDownloadData.filename}</Card.Title>
					<Card.Description class="flex flex-col md:flex-row items-center gap-2">
						<p>Generated on {formatDate($currentDownloadData.generated)}</p>
						<span class="font-bold text-2xl hidden md:block">&middot;</span>
						<p>{convertBytes($currentDownloadData.filesize)}</p>
						<span class="font-bold text-2xl hidden md:block">&middot;</span>
						<p>{isStreamable($currentDownloadData.streamable)}</p>
					</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4">
					<div class="flex flex-col md:flex-row md:flex-wrap w-full md:max-w-max gap-4">
						<Button
							on:click={() => {
								navigator.clipboard.writeText($currentDownloadData.id);
								isIDCopied = true;
								setTimeout(() => {
									isIDCopied = false;
								}, 3000);
							}}
						>
							{#if isIDCopied}
								<ClipboardCheck class="mr-2 h-4 w-4" />
								Copied!
							{:else}
								<Copy class="mr-2 h-4 w-4" />
								Copy ID
							{/if}
						</Button>
						<Button
							on:click={() => {
								navigator.clipboard.writeText($currentDownloadData.download);
								isDownloadLinkCopied = true;
								setTimeout(() => {
									isDownloadLinkCopied = false;
								}, 3000);
							}}
						>
							{#if isDownloadLinkCopied}
								<ClipboardCheck class="mr-2 h-4 w-4" />
								Copied!
							{:else}
								<Copy class="mr-2 h-4 w-4" />
								Copy Download Link
							{/if}
						</Button>
						<Button
							on:click={() => {
								window.open(
									`https://real-debrid.com/streaming-${$currentDownloadData.id}`,
									'_blank'
								);
							}}
						>
							<Play class="mr-2 h-4 w-4" />
							Play On RD
						</Button>
						<Button
							on:click={() => {
								deleteDownload([$currentDownloadData.id]);
							}}
						>
							<Trash class="mr-2 h-4 w-4" />
							Delete
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</div>
