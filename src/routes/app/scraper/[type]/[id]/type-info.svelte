<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	export let info: any;
</script>

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
