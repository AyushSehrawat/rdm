<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Loader2, Trash2 } from 'lucide-svelte';
	import Card from '$lib/components/app/scraper/Card.svelte';

	function debounce<F extends (...args: any[]) => Promise<void>>(
		func: F,
		timeout = 500
	): (...args: Parameters<F>) => void {
		let timer: NodeJS.Timeout;
		return async (...args: Parameters<F>) => {
			clearTimeout(timer);
			timer = setTimeout(async () => {
				await func(...args);
			}, timeout);
		};
	}

	let moviesData: any;
	let seriesData: any;
	let loading = false;

	let fetchedResults = debounce(async (e) => {
		loading = true;
		let query = e.target.value;
		if (query.length === 0) {
			loading = false;
			return;
		}

		let moviesRes = await fetch(
			`https://v3-cinemeta.strem.io/catalog/movie/top/search=${query}.json`
		);
		let seriesRes = await fetch(
			`https://v3-cinemeta.strem.io/catalog/series/top/search=${query}.json`
		);

		loading = false;

		moviesData = await moviesRes.json();
		seriesData = await seriesRes.json();
	});

	function reset() {
		moviesData = null;
		seriesData = null;
	}
</script>

<svelte:head>
	<title>RDM | Scraper</title>
</svelte:head>

<div class="flex flex-col gap-4 w-full p-8 md:px-24 lg:px-32">
	<div class="flex flex-col w-full gap-1.5">
		<Label for="query">Search</Label>
		<Input type="text" id="query" placeholder="something here" on:input={fetchedResults} />
		<p class="text-sm text-muted-foreground">Search for your movie/series/anime here</p>
	</div>
	{#if loading}
		<div class="flex flex-row items-center gap-2">
			<Loader2 class="w-6 h-6 animate-spin" />
			<p class="text-sm">Loading...</p>
		</div>
	{/if}

	{#if moviesData && seriesData}
		<div class="flex items-center justify-between w-full">
			<p>Search results for "{moviesData.query}"</p>
			<Button on:click={reset}>
				<Trash2 class="mr-2 w-4 h-4" />
				<span>Reset</span>
			</Button>
		</div>

		<Tabs.Root value="movies">
			<Tabs.List>
				<Tabs.Trigger value="movies">Movies</Tabs.Trigger>
				<Tabs.Trigger value="series">Series</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="movies">
				{#if moviesData.metas.length === 0}
					<p>No movies found</p>
				{:else}
					<div class="flex flex-row flex-wrap w-full gap-4">
						{#each moviesData.metas as movie, i}
							<Card poster={movie.poster} name={movie.name} releaseInfo={movie.releaseInfo} imdbId={movie.imdb_id} type={movie.type} />
						{/each}
					</div>
				{/if}
			</Tabs.Content>
			<Tabs.Content value="series">
				{#if seriesData.metas.length === 0}
					<p>No series found</p>
				{:else}
					<div class="flex flex-row flex-wrap w-full gap-4">
						{#each seriesData.metas as series, i}
							<Card poster={series.poster} name={series.name} releaseInfo={series.releaseInfo} imdbId={series.imdb_id} type={series.type} />
						{/each}
					</div>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</div>
