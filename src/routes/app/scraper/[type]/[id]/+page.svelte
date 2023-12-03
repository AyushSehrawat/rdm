<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		organizeVideosBySeason,
		getHashes,
		getHash,
		getFilenameMetadata
	} from '$lib/app/helpers';
	import * as Select from '$lib/components/ui/select';
	import * as Sheet from '$lib/components/ui/sheet';
	import { formatDate } from '$lib/app/helpers';
	import { PUBLIC_TORRENTIO_BASE_URI } from '$env/static/public';
	import StreamActions from './stream-actions.svelte';
	import ResultActions from './result-actions.svelte';
	import TypeInfo from './type-info.svelte';
	import Filters from './filters.svelte';
	import { writable, get, type Writable } from 'svelte/store';
	import Trailers from './trailers.svelte';
	import type { TorrentIOResponse } from '$lib/app/types';
	import { toast } from 'svelte-sonner';
	import { Badge } from '$lib/components/ui/badge';

	export let data;
	let title: string = data.props.id;
	let currentSeason: number;
	let videosData: any;
	let torrentIoData: any;
	let limit = writable(10);
	let maxResultsPerQuality: Writable<string | number | undefined | null> = writable(null);

	$: console.log(currentSeason);
	$: console.log('maxResultsPerQuality', get(maxResultsPerQuality));

	interface filtersObjType {
		[key: string]: string;
	}

	const filtersObj: filtersObjType = {
		brremux: 'BluRay Remux',
		hdrall: 'HDR/HDR10+/Dolby Vision',
		dolbyvision: 'Dolby Vision',
		'4k': '4K',
		'1080p': '1080p',
		'720p': '720p',
		'480p': '480p',
		other: 'Other (DVDRip/HDRip/BDRip...',
		scr: 'Screener',
		cam: 'Cam',
		unknown: 'Unknown'
	};

	let filters: Writable<string[]> = writable(['480p', 'other', 'scr', 'cam', 'unknown']);
	let debridOptions = 'debridoptions=nodownloadlinks';

	// TODO: add similar genre

	function setTitle(name: string) {
		title = `RDM | ${name}`;
		return '';
	}

	function organizeVideos(videos: any) {
		videosData = organizeVideosBySeason(videos);
		currentSeason = Number(Object.keys(videosData)[0]);
		return '';
	}

	async function getTorrentIoStreamsData(id: string, info?: any) {
		if (id.startsWith('tmdb')) {
			id = info.meta.imdb_id;
		}

		let appliedFilters = get(filters).join(',');
		let otherFilters = `|${debridOptions}|realdebrid=${data.props.accessToken}`;

		if (get(maxResultsPerQuality)) {
			otherFilters += `|limit=${get(maxResultsPerQuality)}`;
		}

		const res = await fetch(
			`${PUBLIC_TORRENTIO_BASE_URI}/qualityfilter=${appliedFilters}${otherFilters}/stream/${data.props.type}/${id}.json`
		);

		if (data.props.type === 'movie') {
			return res.json();
		} else {
			torrentIoData = await res.json();
		}
	}

	function addToRD(url: string) {
		const _ = fetch(url, {
			method: 'HEAD',
			redirect: 'error'
		});
	}

	function getTitle(streams: any[]) {
		return streams.map((stream) => stream.title).join('\n');
	}

	let getHashesLoading = false;
	let foundHashes: string[] = [];

	$: if (foundHashes.length > 0) {
		toast.success(`Found ${foundHashes.length} torrents already in RD`);
	}

	let getHashesAlreadyInRD = async function getHashesAlreadyInRDData(info: TorrentIOResponse) {
		const hashes = getHashes(info);

		const res = await fetch(`/api/app/torrents/searchHashes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				hashes: hashes
			})
		});

		const data = await res.json();
		foundHashes = data.data.hashes;
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="flex flex-col gap-4 overflow-x-hidden">
	{#await data.streamed.getIdInfo}
		<div class="p-8 md:px-24 lg:px-32">
			<Loader2 class="w-6 h-6 text-primary animate-spin" />
		</div>
	{:then info}
		{setTitle(info.meta.name)}
		<TypeInfo {info} />

		<div class="p-8 md:px-24 lg:px-32 flex flex-col gap-4">
			<Filters {data} {filtersObj} {filters} {maxResultsPerQuality} />

			{#if data.props.type === 'movie'}
				<h2 class="text-2xl font-semibold">Cached Torrents</h2>
				{#await getTorrentIoStreamsData(info.meta.id, info)}
					<div class="flex gap-2">
						<Loader2 class="w-6 h-6 text-primary animate-spin" />
						<p class="text-sm text-muted-foreground">Loading streams...</p>
					</div>
				{:then streams}
					<Button
						disabled={getHashesLoading}
						variant="outline"
						class="max-w-max"
						on:click={async () => {
							getHashesLoading = true;
							await getHashesAlreadyInRD(streams);
							getHashesLoading = false;
						}}
					>
						{#if getHashesLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Show torrents already in RD
					</Button>
					<div class="flex flex-col md:flex-row md:flex-wrap gap-4 w-full">
						{#each streams.streams as stream, i}
							{#if i <= $limit}
								<div
									class:border-green-500={foundHashes.includes(getHash(stream.url))}
									class="w-full md:w-64 flex flex-col break-words gap-2 border rounded-md p-4 justify-between"
								>
									<div class="flex flex-col gap-2">
										<p class="text-sm text-muted-foreground break-words">{stream.name}</p>
										<div class="flex flex-col gap-1">
											{#each stream.title.split('\n') as info}
												<p class="text-sm">{info}</p>
											{/each}
										</div>
									</div>
									<StreamActions url={stream.url} {addToRD} />
								</div>
							{/if}
						{/each}
					</div>
					<ResultActions {limit} torrentIoData={streams} {getTitle} type="movie" />
				{/await}
			{:else if data.props.type === 'series'}
				{#if info.meta.videos}
					{organizeVideos(info.meta.videos)}
					{#if videosData}
						<Select.Root
							onSelectedChange={(selected) => {
								currentSeason = Number(selected?.value);
							}}
							selected={{
								value: Object.keys(videosData)[0],
								label: `Season ${Object.keys(videosData)[0]}`
							}}
						>
							<Select.Trigger class="w-full md:max-w-[180px]">
								<Select.Value placeholder="Select season" />
							</Select.Trigger>
							{#if Object.keys(videosData).length > 7}
								<Select.Content class="h-64 overflow-y-scroll">
									<Select.Label>Seasons</Select.Label>
									{#each Object.keys(videosData) as season}
										<Select.Item value={season} label="Season {season}">Season {season}</Select.Item
										>
									{/each}
								</Select.Content>
							{:else}
								<Select.Content>
									<Select.Label>Seasons</Select.Label>
									{#each Object.keys(videosData) as season}
										<Select.Item value={season} label="Season {season}">Season {season}</Select.Item
										>
									{/each}
								</Select.Content>
							{/if}
						</Select.Root>

						{#if currentSeason === 0}
							<p class="text-sm text-muted-foreground">These are special episodes</p>
						{/if}
						<div class="flex flex-col md:flex-row md:flex-wrap items-start w-full gap-6">
							{#each videosData[currentSeason] as video (video.id)}
								<Sheet.Root
									onOpenChange={async (open) => {
										if (open) {
											await getTorrentIoStreamsData(video.id);
										} else {
											torrentIoData = null;
											limit.set(10);
										}
									}}
								>
									<Sheet.Trigger>
										<div class="flex flex-col gap-4 w-full md:max-w-[18rem]">
											<img
												src={video.thumbnail}
												alt={video.name}
												class="aspect-video w-full md:w-72 h-full md:h-[10rem] rounded-md hover:opacity-80 transition-opacity duration-200"
												on:error={() =>
													(video.thumbnail =
														'https://via.placeholder.com/300x150.png?text=No+thumbnail')}
											/>
											<div class="flex flex-col gap-1 text-start">
												<h2 class="text-base break-words">{video.episode}. {video.name}</h2>
												<p class="text-sm text-muted-foreground">
													{formatDate(video.released, 'short')}
												</p>
											</div>
										</div>
									</Sheet.Trigger>
									<Sheet.Content class="overflow-y-scroll">
										<Sheet.Header>
											<Sheet.Title>{video.name}</Sheet.Title>
											<Sheet.Description>
												{#if video.description}
													{video.description}
												{/if}

												<div class="flex flex-col gap-4 mt-4">
													<h2 class="text-2xl font-semibold">Cached Torrents</h2>
													{#if !torrentIoData}
														<p class="text-sm text-muted-foreground">Loading streams...</p>
													{:else}
														<Button
															disabled={getHashesLoading}
															variant="outline"
															class="max-w-max"
															on:click={async () => {
																getHashesLoading = true;
																await getHashesAlreadyInRD(torrentIoData);
																getHashesLoading = false;
															}}
														>
															{#if getHashesLoading}
																<Loader2 class="mr-2 h-4 w-4 animate-spin" />
															{/if}
															Show torrents already in RD
														</Button>
														{#each torrentIoData.streams as stream, i}
															{#if i <= $limit}
																<div
																	class:border-green-500={foundHashes.includes(getHash(stream.url))}
																	class="w-full flex flex-col break-words gap-2 border rounded-md p-4 justify-between"
																>
																	<div class="flex flex-col gap-2">
																		<p class="text-sm text-muted-foreground break-words">
																			{stream.name}
																		</p>
																		<div class="flex flex-col gap-1">
																			{#each stream.title.split('\n') as info, i}
																				{#if i === 0}
																					{@const metadata = getFilenameMetadata(info)}
																					<div class="flex items-center gap-1 flex-wrap">
																						<p class="text-sm">
																							{info}
																						</p>
																						{#if metadata.parsedData.fullSeason}
																							<Badge variant="outline">Full Season</Badge>
																						{/if}
																					</div>
																				{:else}
																					<p class="text-sm">{info}</p>
																				{/if}
																			{/each}
																		</div>
																	</div>
																	<StreamActions url={stream.url} {addToRD} />
																</div>
															{/if}
														{/each}
														<ResultActions {limit} {torrentIoData} {getTitle} type="series" />
													{/if}
												</div>
											</Sheet.Description>
										</Sheet.Header>
									</Sheet.Content>
								</Sheet.Root>
							{/each}
						</div>
					{/if}
				{/if}
			{/if}

			<Trailers {info} />
		</div>
	{:catch error}
		<p class="text-sm text-muted-foreground">Error: {error.message}</p>
	{/await}
</div>
