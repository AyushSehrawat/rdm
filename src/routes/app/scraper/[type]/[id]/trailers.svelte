<script lang="ts">
	export let info: any;
</script>

{#if info.meta.trailerStreams}
	<div
		class="flex flex-col items-center md:items-start text-center md:text-start gap-2 w-full mt-8"
	>
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
