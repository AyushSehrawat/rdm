<script lang="ts">
	import TableActions from './table-actions.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Loader2, Trash, PlusCircle, Copy, ClipboardCheck, Unlock } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import {
		formatDate,
		convertBytes,
		capitalizeFirstLetter,
		removeFirstChar
	} from '$lib/app/helpers';
	import { goto } from '$app/navigation';

	export let data;

	// TODO: remove reactivity from this
	$: getTorrentInfo = data.streamed.getTorrentInfo;

	let totalSelectedFiles = 0;

	function incrementSelectedFiles() {
		totalSelectedFiles++;
		return '';
	}

	function filterSelected(lst: any[]) {
		return lst.filter((item) => item.selected === 1);
	}

	let isIDCopied = false;
	let isMagnetCopied = false;

	let deleteTorrent = async function deleteTorrentData(ids: string[]) {
		const data = await fetch(`/api/app/torrents`, {
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

		goto('/app/torrents');
	};
</script>

<div class="flex flex-col p-8 md:px-24 lg:px-32 gap-4 w-full">
	<h2 class="text-xl font-semibold">Torrent info for {data.props.id}</h2>

	{#await getTorrentInfo}
		<div class="flex w-full items-center justify-center">
			<Loader2 class="w-8 h-8 animate-spin" />
		</div>
	{:then torrentInfo}
		<div class="flex flex-col w-full">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-start break-words">{torrentInfo.filename}</Card.Title>
					<Card.Description class="flex flex-col md:flex-row items-center gap-2">
						<p>Added on {formatDate(torrentInfo.added)}</p>
						<span class="font-bold text-2xl hidden md:block">&middot;</span>
						<p>{convertBytes(torrentInfo.bytes)}</p>
						<span class="font-bold text-2xl hidden md:block">&middot;</span>
						<p>{capitalizeFirstLetter(torrentInfo.status)}</p>
					</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4">
					<div class="flex flex-col md:flex-row md:flex-wrap w-full md:max-w-max gap-4">
						<Button
							on:click={() => {
								navigator.clipboard.writeText(data.props.id);
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
								navigator.clipboard.writeText(`magnet:?xt=urn:btih:${torrentInfo.hash}`);
								isMagnetCopied = true;
								setTimeout(() => {
									isMagnetCopied = false;
								}, 3000);
							}}
						>
							{#if isMagnetCopied}
								<ClipboardCheck class="mr-2 h-4 w-4" />
								Copied!
							{:else}
								<Copy class="mr-2 h-4 w-4" />
								Copy magnet link
							{/if}
						</Button>
						<Button
							on:click={() => {
								deleteTorrent([data.props.id]);
							}}
						>
							<Trash class="mr-2 h-4 w-4" />
							Delete
						</Button>
						<Button disabled>
							<PlusCircle class="mr-2 h-4 w-4" />
							Reinsert (Soon)
						</Button>
						<Button disabled>
							<Unlock class="mr-2 h-4 w-4" />
							Unrestrict All (Soon)
						</Button>
					</div>
					<p class="break-words"><span class="font-semibold">Hash: </span>{torrentInfo.hash}</p>
					<div class="flex flex-col w-full">
						<p class="font-semibold">Files</p>
						<Table.Root>
							<Table.Caption>{totalSelectedFiles} files selected</Table.Caption>
							<Table.Header>
								<Table.Row>
									<Table.Head class="w-[100px]">ID</Table.Head>
									<Table.Head>Path</Table.Head>
									<Table.Head class="text-right">Size</Table.Head>
									<Table.Head class="w-[100px] text-right" />
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each filterSelected(torrentInfo.files) as torrentFile, i}
									<Table.Row>
										<Table.Cell class="font-medium">{torrentFile.id}</Table.Cell>
										<Table.Cell>{removeFirstChar(torrentFile.path)}</Table.Cell>
										<Table.Cell class="text-right">{convertBytes(torrentFile.bytes)}</Table.Cell>
										<Table.Cell class="text-right">
											<TableActions link={torrentInfo.links[i]} />
										</Table.Cell>
									</Table.Row>
									{incrementSelectedFiles()}
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{:catch error}
		<p class="text-red-500">{error.message}</p>
	{/await}
</div>
