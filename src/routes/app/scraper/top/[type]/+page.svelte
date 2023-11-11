<script lang="ts">
	import Card from '$lib/components/app/scraper/Card.svelte';

	export let data;
</script>

<div class="flex flex-col gap-4 p-8 md:px-24 lg:px-32 w-full">
	<div class="flex flex-row flex-wrap w-full gap-4">
		{#each data.top.metas as top}
			<Card
				poster={top.poster}
				name={top.name}
				releaseInfo={top.releaseInfo}
				imdbId={top.imdb_id}
				type={top.type}
			/>
		{/each}
	</div>
</div>
