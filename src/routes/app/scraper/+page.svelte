<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { debounce } from '$lib/app/helpers';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import Card from '$lib/components/app/scraper/Card.svelte';
	import { Loader2, Trash2 } from 'lucide-svelte';

	export let data;
	let loading = false;
	let query = $page.url.searchParams.get('query') || '';
	$: movies = data.movies;
	$: series = data.series;

	let fetchedResults = debounce(async (e) => {
		loading = true;
		query = e.target.value;
		if (query.length === 0) {
			goto(`?`, { invalidateAll: true });
		}
		goto(`?query=${query}`, { invalidateAll: true });
		loading = false;
	});
</script>

<svelte:head>
	<title>RDM | Scraper</title>
</svelte:head>

<div class="flex flex-col gap-4 w-full p-8 md:px-24 lg:px-32">
	<div class="flex flex-col w-full gap-1.5">
		<Label for="query">Search</Label>
		<Input
			type="text"
			id="query"
			placeholder="something here"
			bind:value={query}
			on:input={fetchedResults}
		/>
		<p class="text-sm text-muted-foreground">Search for your movie/series/anime here</p>
	</div>
	{#if loading}
		<div class="flex flex-row items-center gap-2">
			<Loader2 class="w-6 h-6 animate-spin" />
			<p class="text-sm">Loading...</p>
		</div>
	{/if}
	{#if query.length > 0}
		<p>Search results for <span class="font-semibold">{query}</span></p>

		<Tabs.Root value="movies">
			<Tabs.List>
				<Tabs.Trigger value="movies">Movies</Tabs.Trigger>
				<Tabs.Trigger value="series">Series</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="movies">
				{#if movies.length === 0}
					<p>No movies found</p>
				{:else}
					<div class="flex flex-row flex-wrap w-full gap-4">
						{#each movies as movie, i}
							<Card
								poster={movie.poster}
								name={movie.name}
								releaseInfo={movie.releaseInfo}
								imdbId={movie.imdb_id}
								type={movie.type}
							/>
						{/each}
					</div>
				{/if}
			</Tabs.Content>
			<Tabs.Content value="series">
				{#if series.length === 0}
					<p>No series found</p>
				{:else}
					<div class="flex flex-row flex-wrap w-full gap-4">
						{#each series as series, i}
							<Card
								poster={series.poster}
								name={series.name}
								releaseInfo={series.releaseInfo}
								imdbId={series.imdb_id}
								type={series.type}
							/>
						{/each}
					</div>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</div>
