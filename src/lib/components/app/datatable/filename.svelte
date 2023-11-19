<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { ParsedDownloadsResponse, ParsedTorrentsResponse } from '$lib/app/types';

	export let filedata: ParsedDownloadsResponse | ParsedTorrentsResponse;
</script>

{#if filedata.metadata?.parsedData?.title}
	<p class="font-semibold">{filedata.metadata?.parsedData?.title}</p>
{/if}
<p class="text-xs text-muted-foreground">{filedata.filename}</p>
<div class="flex gap-1 items-start flex-wrap">
	{#if filedata.metadata?.parsedData?.seasons && filedata.metadata?.parsedData?.seasons.length > 0}
		{#each filedata.metadata?.parsedData?.seasons as season}
			<Badge variant="outline">
				S{season}
			</Badge>
		{/each}
	{/if}
	{#if filedata.metadata?.parsedData?.episodeNumbers && filedata.metadata?.parsedData?.episodeNumbers.length > 0}
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
	{#if filedata.metadata?.parsedData?.fullSeason && filedata.metadata?.parsedData?.fullSeason === true}
		<Badge variant="outline">Full Season</Badge>
	{/if}
</div>
