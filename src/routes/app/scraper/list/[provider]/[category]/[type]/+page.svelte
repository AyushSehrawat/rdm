<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/app/helpers';
	import Card from '$lib/components/app/scraper/Card.svelte';

	export let data: any;
</script>

<svelte:head>
	<title>
		{capitalizeFirstLetter(data.provider)} &bull; {capitalizeFirstLetter(data.category)}
		{capitalizeFirstLetter(data.type)} &bull; RDM
	</title>
</svelte:head>

<div class="flex flex-col gap-4 p-8 md:px-24 lg:px-32 w-full">
	<h1 class="text-2xl font-semibold underline">
		{capitalizeFirstLetter(data.provider)} &bull; {capitalizeFirstLetter(data.category)}
		{capitalizeFirstLetter(data.type)}
	</h1>
	<div class="flex flex-row flex-wrap w-full gap-4">
		{#each data.items.metas as item}
			<Card
				poster={item.poster}
				name={item.name}
				releaseInfo={item.releaseInfo || item.year}
				imdbId={item.imdb_id || item.id}
				type={item.type}
			/>
		{/each}
	</div>
</div>
