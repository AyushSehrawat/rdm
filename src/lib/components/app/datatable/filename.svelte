<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { ParsedDownloadsResponse, ParsedTorrentsResponse } from '$lib/app/types';

	// TODO: add type
	export let filedata: any;
	const fileCount = filedata.links?.length || null;
</script>

<div class="flex flex-row gap-1 items-center flex-wrap">
	{#if filedata.metadata?.parsedData?.title}
		<p class="font-semibold">{filedata.metadata?.parsedData?.title}</p>
	{:else}
		<p class="font-semibold">{filedata.filename}</p>
	{/if}

	{#if fileCount}
		<Badge variant="outline">
			{fileCount}
			{fileCount === 1 ? 'file' : 'files'}
		</Badge>
	{/if}
	{#if filedata.metadata?.parsedData?.fullSeason}
		<Badge variant="secondary">Full Season</Badge>
	{/if}
</div>
<p class="text-xs text-muted-foreground">{filedata.filename}</p>
<div class="flex gap-1 items-start flex-wrap">
	{#if filedata.metadata?.parsedData?.seasons?.length}
		{#each filedata.metadata?.parsedData?.seasons as season}
			<Badge variant="outline">
				S{season}
			</Badge>
		{/each}
	{/if}
	{#if filedata.metadata?.parsedData?.episodeNumbers?.length}
		{#each filedata.metadata?.parsedData?.episodeNumbers as episode}
			<Badge variant="outline">
				E{episode}
			</Badge>
		{/each}
	{/if}
	{#if filedata.metadata?.parsedData?.resolution}
		<Badge variant="outline">
			{filedata.metadata?.parsedData?.resolution}
		</Badge>
	{/if}
	{#if filedata.metadata?.parsedData?.year}
		<Badge variant="outline">
			{filedata.metadata?.parsedData?.year}
		</Badge>
	{/if}
	{#if filedata.metadata?.parsedData?.languages}
		{#each filedata.metadata?.parsedData?.languages as language}
			<Badge variant="outline">{language}</Badge>
		{/each}
	{/if}
</div>
