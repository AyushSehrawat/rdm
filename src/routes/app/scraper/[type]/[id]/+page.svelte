<script lang="ts">
	import { Loader2, Copy, PlusSquare } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { organizeVideosBySeason } from '$lib/app/helpers';
	import * as Select from '$lib/components/ui/select';
	import * as Sheet from '$lib/components/ui/sheet';
	import { formatDate } from '$lib/app/helpers';
	import { PUBLIC_TORRENTIO_BASE_URI } from '$env/static/public';
	import { toast } from '@zerodevx/svelte-toast';

	export let data;

	let title = data.props.id;
	let currentSeason: number;
	let videosData: any;

	let limit = 10;

	// TODO: add torrentio
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

	$: console.log(currentSeason);

	let torrentIoData: any;

	async function getTorrentIoStreamsData(id: string) {
		const res = await fetch(
			`${PUBLIC_TORRENTIO_BASE_URI}${data.props.accessToken}/stream/${data.props.type}/${id}.json`
		);
		if (data.props.type === 'movie') {
			return res.json();
		} else {
			torrentIoData = await res.json();
		}
	}

	function copiedToClipboard() {
		toast.push('Copied to clipboard', {
			theme: {
				'--toastColor': 'mintcream',
				'--toastBackground': 'rgba(72,187,120,1)',
				'--toastBarBackground': '#2F855A'
			}
		});
	}
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
		<div
			class="flex w-screen h-max bg-cover bg-top"
			style="background-image: url({info.meta.background})"
		>
			<div class="flex bg-black bg-opacity-60 w-full h-full">
				<div class="flex items-center md:items-start w-full h-full">
					<div
						class="flex flex-col md:flex-row w-full h-full gap-4 items-center md:items-start p-8 md:px-24 lg:px-32"
					>
						<div class="relative">
							<Badge class="absolute top-2 right-2">{info.meta.imdbRating}</Badge>
							<img
								src={info.meta.poster}
								alt={info.meta.name}
								class="min-w-[12rem] h-72 rounded-md bg-cover bg-center"
							/>
						</div>
						<div class="flex flex-col gap-2 items-center md:items-start text-center md:text-start">
							<h1 class="text-3xl font-bold break-words text-white">{info.meta.name}</h1>
							<p class="text-sm break-words text-white max-w-5xl">{info.meta.description}</p>
							<div class="flex flex-row gap-2">
								<Badge>{info.meta.releaseInfo}</Badge>
								<Badge>{info.meta.runtime}</Badge>
								{#if info.meta.status}
									<Badge>{info.meta.status}</Badge>
								{/if}
							</div>
							<div class="flex flex-row gap-2">
								{#each info.meta.genres as genre}
									<Badge>{genre}</Badge>
								{/each}
							</div>
							<Badge>{info.meta.country}</Badge>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="p-8 md:px-24 lg:px-32 flex flex-col gap-4">
			{#if data.props.type === 'movie'}
				<h2 class="text-2xl font-semibold">Torrents</h2>
				{#await getTorrentIoStreamsData(info.meta.id)}
					<div class="flex gap-2">
						<Loader2 class="w-6 h-6 text-primary animate-spin" />
						<p class="text-sm text-muted-foreground">Loading streams...</p>
					</div>
				{:then streams}
					<div class="flex flex-col md:flex-row md:flex-wrap gap-4 w-full">
						{#each streams.streams as stream, i}
							{#if i <= limit}
								<div
									class="w-full md:w-64 flex flex-col break-words gap-2 border rounded-md p-4 justify-between"
								>
									<div class="flex flex-col gap-2">
										<p class="text-sm text-muted-foreground break-words">{stream.name}</p>
										<div class="flex flex-col gap-1">
											{#each stream.title.split('\n') as info, i}
												<p class="text-sm">{info}</p>
											{/each}
										</div>
									</div>
									<div class="flex items-center gap-2">
										<Button
											on:click={() => {
												navigator.clipboard.writeText(stream.url);
												copiedToClipboard();
											}}
										>
											<Copy class="w-4 h-4" />
										</Button>
										<Button>
											<PlusSquare class="w-4 h-4" />
										</Button>
									</div>
								</div>
							{/if}
						{/each}
					</div>
					<div class="flex flex-col md:flex-row gap-2">
						<Button
							class="w-full md:max-w-[180px]"
							on:click={() => {
								limit += 10;
							}}>Show more</Button
						>
						<Button
							on:click={() => {
								limit = streams.streams.length;
							}}
							class="w-full md:max-w-[180px]">Show all</Button
						>
						<Button
							class="w-full md:max-w-[180px]"
							on:click={() => {
								limit = 10;
							}}>Show less</Button
						>
					</div>
				{/await}
			{/if}

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
						<Select.Content>
							<Select.Label>Seasons</Select.Label>
							{#each Object.keys(videosData) as season}
								<Select.Item value={season} label="Season {season}">Season {season}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>

					{#if currentSeason === 0}
						<p class="text-sm text-muted-foreground">These are special episodes</p>
					{/if}
					<div class="flex flex-col md:flex-row md:flex-wrap items-start w-full gap-6">
						{#each videosData[currentSeason] as video, i}
							<Sheet.Root
								onOpenChange={async (open) => {
									if (open) {
										await getTorrentIoStreamsData(video.id);
									} else {
										torrentIoData = null;
										limit = 10;
									}
								}}
							>
								<Sheet.Trigger>
									<div class="flex flex-col gap-4 w-full md:max-w-[18rem]">
										<img
											src={video.thumbnail}
											alt={video.name}
											class="aspect-video w-full md:w-72 h-full md:h-[10rem] rounded-md hover:opacity-80 transition-opacity duration-200"
											onerror="this.src='https://via.placeholder.com/300x150.png?text=No+thumbnail';"
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
												<h2 class="text-2xl font-semibold">Torrents</h2>
												{#if !torrentIoData}
													<p class="text-sm text-muted-foreground">Loading streams...</p>
												{:else}
													{#each torrentIoData.streams as stream, i}
														{#if i <= limit}
															<div
																class="w-full flex flex-col break-words gap-2 border rounded-md p-4 justify-between"
															>
																<div class="flex flex-col gap-2">
																	<p class="text-sm text-muted-foreground break-words">
																		{stream.name}
																	</p>
																	<div class="flex flex-col gap-1">
																		{#each stream.title.split('\n') as info, i}
																			<p class="text-sm">{info}</p>
																		{/each}
																	</div>
																</div>
																<div class="flex items-center gap-2">
																	<Button
																		on:click={() => {
																			navigator.clipboard.writeText(stream.url);
																			copiedToClipboard();
																		}}
																	>
																		<Copy class="w-4 h-4" />
																	</Button>
																	<Button>
																		<PlusSquare class="w-4 h-4" />
																	</Button>
																</div>
															</div>
														{/if}
													{/each}
													<div class="flex flex-col gap-2">
														<Button
															class="w-full"
															on:click={() => {
																limit += 10;
															}}>Show more</Button
														>
														<Button
															on:click={() => {
																limit = torrentIoData.streams.length;
															}}
															class="w-full">Show all</Button
														>
														<Button
															class="w-full"
															on:click={() => {
																limit = 10;
															}}>Show less</Button
														>
													</div>
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

			{#if info.meta.trailerStreams}
				<div class="flex flex-col items-center md:items-start gap-2 w-full mt-8">
					<h2 class="text-2xl font-semibold">Trailer</h2>
					<div
						class="flex flex-row flex-wrap gap-4 items-center md:items-start justify-center md:justify-start w-full"
					>
						{#each info.meta.trailerStreams as trailer}
							<iframe
								title={trailer.title}
								src="https://www.youtube-nocookie.com/embed/{trailer.ytId}"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
								allowfullscreen
								class="aspect-video w-96 h-[13.5rem] rounded-md"
							/>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:catch error}
		<p class="text-sm text-muted-foreground">Error: {error.message}</p>
	{/await}
</div>
