<script lang="ts">
	export let poster: string;
	export let name: string;
	export let releaseInfo: string;
	export let imdbId: string;
	export let type: string;

	let fallback = 'https://via.placeholder.com/198x228.png?text=No+thumbnail';
</script>

<a
	href="/app/scraper/{type}/{imdbId}"
	class="flex flex-col group justify-end gap-2 w-36 md:w-48 h-72 rounded-md bg-cover bg-center relative select-none"
	style="background-image: url({poster})"
>
	<img alt="test" src={poster} on:error={() => (poster = fallback)} class="hidden" />

	<div
		class="bg-black bg-opacity-60 text-white p-2 absolute bottom-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
	>
		<p class="text-sm max-w-[9rem] md:max-w-[12rem]">{name}</p>
		<p class="text-xs max-w-[9rem] md:max-w-[12rem]">{releaseInfo}</p>
	</div>
</a>
