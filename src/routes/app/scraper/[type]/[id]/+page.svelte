<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	export let data;

	// TODO: add torrentio
	// TODO: add similar genre
</script>

<div class="flex flex-col gap-4 overflow-x-hidden">
	{#await data.streamed.getIdInfo}
		<div class="p-8 md:px-24 lg:px-32">
			<Loader2 class="w-6 h-6 text-primary" />
		</div>
	{:then info}
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
							<p class="text-sm break-words text-white">{info.meta.description}</p>
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
			{#if info.meta.trailerStreams}
				<div class="flex flex-col items-center md:items-start gap-2">
					<h2 class="text-2xl font-semibold">Trailer</h2>
					<div class="flex flex-col md:flex-row gap-4">
						{#each info.meta.trailerStreams as trailer}
							<iframe
								title={trailer.title}
								src="https://www.youtube.com/embed/{trailer.ytId}"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
								allowfullscreen
								class="aspect-[16/9] w-96 rounded-md"
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
