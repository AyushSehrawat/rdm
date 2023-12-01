<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { debounce } from '$lib/app/helpers';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import Card from '$lib/components/app/scraper/Card.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Loader2 } from 'lucide-svelte';

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

	const listObj = [
		{
			name: 'Top Movies',
			ref: '/app/scraper/list/cinemeta/top/movie'
		},
		{
			name: 'Top Series',
			ref: '/app/scraper/list/cinemeta/top/series'
		},
		{
			name: 'Featured Movies',
			ref: '/app/scraper/list/cinemeta/featured/movie'
		},
		{
			name: 'Featured Series',
			ref: '/app/scraper/list/cinemeta/featured/series'
		},
		{
			name: 'Trakt Trending Movies',
			ref: '/app/scraper/list/trakt/trending/movies'
		},
		{
			name: 'Trakt Trending Series',
			ref: '/app/scraper/list/trakt/trending/series'
		},
		{
			name: 'Trakt Popular Movies',
			ref: '/app/scraper/list/trakt/popular/movies'
		},
		{
			name: 'Trakt Popular Series',
			ref: '/app/scraper/list/trakt/popular/series'
		},
		{
			name: 'TMDB Top Movies',
			ref: '/app/scraper/list/tmdb/top/movie'
		},
		{
			name: 'TMDB Top Series',
			ref: '/app/scraper/list/tmdb/top/series'
		}
	];
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
				{#if loading}
					<Loader2 class="w-6 h-6 animate-spin" />
				{:else if movies.length === 0 && !loading}
					<p>No movies found</p>
				{:else}
					<div class="flex flex-row flex-wrap w-full gap-4">
						{#each movies as movie}
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
				{#if loading}
					<Loader2 class="w-6 h-6 animate-spin" />
				{:else if series.length === 0 && !loading}
					<p>No series found</p>
				{:else}
					<div class="flex flex-row flex-wrap w-full gap-4">
						{#each series as series}
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
	<div class="flex flex-col gap-2">
		<h2 class="text-xl font-semibold mt-8">Checkout these lists</h2>
		<p class="text-sm text-muted-foreground">Some of these list may not work</p>
	</div>
	<div class="flex flex-col md:flex-row md:flex-wrap w-full gap-4">
		{#each listObj as list}
			<Button variant="outline" class="w-full md:w-auto" href={list.ref}>{list.name}</Button>
		{/each}
	</div>
</div>
