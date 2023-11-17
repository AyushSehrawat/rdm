<script lang="ts">
	import TableActions from './table-actions.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import TreeView from '$lib/components/app/treeview/treeview.svelte';
	import { Loader2, Trash, PlusCircle, Copy, Unlock } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import {
		formatDate,
		convertBytes,
		capitalizeFirstLetter,
		removeFirstChar,
		buildTree
	} from '$lib/app/helpers';
	import { goto } from '$app/navigation';
	import { get, writable, type Writable } from 'svelte/store';
	import { setContext } from 'svelte';

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
								toast.success('Copied torrent ID to clipboard!');
							}}
						>
							<Copy class="mr-2 h-4 w-4" />
							Copy ID
						</Button>
						<Button
							on:click={() => {
								navigator.clipboard.writeText(`magnet:?xt=urn:btih:${torrentInfo.hash}`);
								toast.success('Copied magnet link to clipboard!');
							}}
						>
							<Copy class="mr-2 h-4 w-4" />
							Copy magnet link
						</Button>
						<Button
							on:click={() => {
								deleteTorrent(data.props.id);
								toast.success('Deleted torrent!');
							}}
						>
							<Trash class="mr-2 h-4 w-4" />
							Delete
						</Button>
						<AlertDialog.Root>
							<AlertDialog.Trigger asChild let:builder>
								<Button builders={[builder]}>
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
										<p class="text-sm break-words border-b">{torrentInfo.filename}</p>
										<p class="text-sm break-words border-b">{torrentInfo.hash}</p>
										<p class="text-sm break-words">
											Selected size {convertBytes(torrentInfo.bytes)}
										</p>
										<p class="text-sm break-words border-b">
											Original size {convertBytes(torrentInfo.original_bytes)}
										</p>
										<p class="text-sm break-words border-b">
											{$selected.length} / {torrentInfo.files.length} files selected
										</p>
										<div class="flex flex-col max-h-96 overflow-scroll">
											{#each buildTree(torrentInfo.files) as file}
												<TreeView {file} />
											{/each}
										</div>
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action
										on:click={() => {
											reinsertTorrent(torrentInfo.hash);
										}}>Continue</AlertDialog.Action
									>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>

						<Button disabled>
							<Unlock class="mr-2 h-4 w-4" />
							Unrestrict All (Soon)
						</Button>
					</div>
					<p class="break-words"><span class="font-semibold">Hash: </span>{torrentInfo.hash}</p>
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
								{#each filterSelected(torrentInfo.files) as torrentFile, i}
									<Table.Row>
										<Table.Cell class="font-medium">{torrentFile.id}</Table.Cell>
										<Table.Cell>{removeFirstChar(torrentFile.path)}</Table.Cell>
										<Table.Cell class="text-right">{convertBytes(torrentFile.bytes)}</Table.Cell>
										<Table.Cell class="text-right">
											<TableActions link={torrentInfo.links[i]} />
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
