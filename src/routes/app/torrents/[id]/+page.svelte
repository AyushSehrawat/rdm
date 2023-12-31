<script lang="ts">
	import TableActions from './table-actions.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import TreeView from '$lib/components/app/treeview/treeview.svelte';
	import { Loader2, Trash, PlusCircle, Copy, Unlock } from 'lucide-svelte';
	import { Progress } from '$lib/components/ui/progress';
	import { toast } from 'svelte-sonner';
	import {
		formatDate,
		convertBytes,
		capitalizeFirstLetter,
		removeFirstChar,
		buildTree
	} from '$lib/app/helpers';
	import { goto, invalidateAll } from '$app/navigation';
	import { get, writable, type Writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import type { APIResponse, UnrestrictResponse } from '$lib/app/types';

	export let data;

	$: selected = writable([]) as Writable<string[]>;
	$: setContext('selected', selected);
	$: getTorrentInfo = data.streamed.getTorrentInfo;

	let totalSelectedFiles = 0;

	function incrementSelectedFiles(id: string) {
		totalSelectedFiles++;
		selected.update((lst) => [...lst, id]);
		return '';
	}

	function filterSelected(lst: any[]) {
		return lst.filter((item) => item.selected === 1);
	}

	let deleteTorrent = async function deleteTorrentData(id: string) {
		const data = await fetch(`/api/app/torrents/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		let resp = await data.json();
		if (resp.success === true) {
			toast.success(`Success! ${resp.message}`);
		} else if (resp.success === false) {
			toast.error(`Error! ${resp.error}`);
		}

		goto('/app/torrents');
	};

	let reinsertTorrent = async function reinsertTorrentData(hash: string) {
		const deletedData = await fetch(`/api/app/torrents/${data.props.id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		let deletedResp = await deletedData.json();
		if (deletedResp.success === true) {
			toast.success(`Success! ${deletedResp.message}. Reinserting...`);

			const reinsertRes = await fetch(`/api/app/torrents/addMagnet`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					hash: hash,
					selectedFilesId: get(selected)
				})
			});

			const reinsertResp = await reinsertRes.json();

			if (reinsertRes.status === 200) {
				toast.success(`Success! ${reinsertResp.message}. Redirecting...`);
				totalSelectedFiles = 0;
				selected.set([]);
				goto(`/app/torrents/${reinsertResp.id}`, { invalidateAll: true });
			} else {
				toast.error(`Error! ${reinsertResp.status} ${reinsertResp.error}. Try again later.`);
			}
		} else if (deletedResp.success === false) {
			toast.error(`Error! ${deletedResp.error}`);
		}
	};

	let unrestrictedOneStatus: string;
	let unrestrictProgress: number | null;
	let failedOnes: string[] = [];
	let maxUnrestrictProgress: number;

	let bulkUnrestrict = async function bulkUnrestrictDataItems(links: string[]): Promise<void> {
		unrestrictedOneStatus = '';
		unrestrictProgress = 0;

		for (const link of links) {
			const data = await fetch(`/api/app/unrestrict`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					link: link
				})
			});

			let resp: APIResponse<UnrestrictResponse> = await data.json();
			if (resp.success === true) {
				unrestrictedOneStatus = `Unrestricted ${resp.data?.filename}`;
			} else if (resp.success === false) {
				failedOnes.push(link);
			}

			unrestrictProgress++;
			await new Promise((resolve) => setTimeout(resolve, 200));
		}

		if (failedOnes.length > 0) {
			toast.error(`Failed to unrestrict ${failedOnes.length} / ${links.length} links`);
		} else {
			toast.success(`Unrestricted ${links.length} links`);
		}

		unrestrictProgress = null;
		failedOnes = [];

		await invalidateAll();
	};
</script>

<svelte:head>
	<title>{data.props.id} Info | RDM</title>
</svelte:head>

<div class="flex flex-col p-8 md:px-24 lg:px-32 gap-4 w-full">
	<h2 class="text-xl font-semibold">Torrent info for {data.props.id}</h2>

	{#await getTorrentInfo}
		<div class="flex w-full items-center justify-center">
			<Loader2 class="w-8 h-8 animate-spin" />
		</div>
	{:then torrentInfo}
		{#if unrestrictProgress}
			<div class="flex flex-col my-4 gap-2">
				<p class="text-sm text-muted-foreground">
					{unrestrictedOneStatus}
				</p>
				<Progress value={unrestrictProgress} max={maxUnrestrictProgress} />
				<p class="text-sm text-muted-foreground">
					Unrestricting {unrestrictProgress} / {maxUnrestrictProgress}
				</p>
			</div>
		{/if}
		<div class="flex flex-col w-full">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-start break-words">{torrentInfo.data.filename}</Card.Title>
					<Card.Description class="flex flex-col md:flex-row items-center gap-2">
						<p>Added on {formatDate(torrentInfo.data.added)}</p>
						<span class="font-bold text-2xl hidden md:block">&middot;</span>
						<p>{convertBytes(torrentInfo.data.bytes)}</p>
						<span class="font-bold text-2xl hidden md:block">&middot;</span>
						<p>{capitalizeFirstLetter(torrentInfo.data.status)}</p>
					</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4">
					<div class="flex flex-col md:flex-row md:flex-wrap w-full md:max-w-max gap-4">
						<Button
							variant="outline"
							on:click={() => {
								navigator.clipboard.writeText(data.props.id);
								toast.success('Copied torrent ID to clipboard!');
							}}
						>
							<Copy class="mr-2 h-4 w-4" />
							Copy ID
						</Button>
						<Button
							variant="outline"
							on:click={() => {
								navigator.clipboard.writeText(`magnet:?xt=urn:btih:${torrentInfo.data.hash}`);
								toast.success('Copied magnet link to clipboard!');
							}}
						>
							<Copy class="mr-2 h-4 w-4" />
							Copy magnet link
						</Button>
						<AlertDialog.Root>
							<AlertDialog.Trigger asChild let:builder>
								<Button variant="secondary" builders={[builder]}>
									<PlusCircle class="mr-2 h-4 w-4" />
									Reinsert
								</Button>
							</AlertDialog.Trigger>
							<AlertDialog.Content class="w-full max-w-max">
								<AlertDialog.Header>
									<AlertDialog.Title class="break-words"
										>Reinserting {data.props.id}</AlertDialog.Title
									>
									<AlertDialog.Description class="flex flex-col gap-2">
										<p class="text-sm break-words border-b">{torrentInfo.data.filename}</p>
										<p class="text-sm break-words border-b">{torrentInfo.data.hash}</p>
										<p class="text-sm break-words">
											Selected size {convertBytes(torrentInfo.data.bytes)}
										</p>
										<p class="text-sm break-words border-b">
											Original size {convertBytes(torrentInfo.data.original_bytes)}
										</p>
										<p class="text-sm break-words border-b">
											{$selected.length} / {torrentInfo.data.files.length} files selected
										</p>
										<div class="flex flex-col max-h-96 overflow-scroll">
											{#each buildTree(torrentInfo.data.files) as file}
												<TreeView {file} />
											{/each}
										</div>
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action
										on:click={() => {
											reinsertTorrent(torrentInfo.data.hash);
										}}>Continue</AlertDialog.Action
									>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>

						<Button
							on:click={() => {
								maxUnrestrictProgress = torrentInfo.data.links.length;
								bulkUnrestrict(torrentInfo.data.links);
							}}
							variant="secondary"
						>
							<Unlock class="mr-2 h-4 w-4" />
							Unrestrict All
						</Button>
						<Button
							variant="destructive"
							on:click={() => {
								deleteTorrent(data.props.id);
								toast.success('Deleted torrent!');
							}}
						>
							<Trash class="mr-2 h-4 w-4" />
							Delete
						</Button>
					</div>
					<p class="break-words">
						<span class="font-semibold">Hash: </span>{torrentInfo.data.hash}
					</p>
					<div class="flex flex-col w-full">
						<p class="font-semibold">Selected Files</p>
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
								{#each filterSelected(torrentInfo.data.files) as torrentFile, i}
									<Table.Row>
										<Table.Cell class="font-medium">{torrentFile.id}</Table.Cell>
										<Table.Cell>{removeFirstChar(torrentFile.path)}</Table.Cell>
										<Table.Cell class="text-right">{convertBytes(torrentFile.bytes)}</Table.Cell>
										<Table.Cell class="text-right">
											<TableActions link={torrentInfo.data.links[i]} />
										</Table.Cell>
									</Table.Row>
									{incrementSelectedFiles(torrentFile.id)}
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
