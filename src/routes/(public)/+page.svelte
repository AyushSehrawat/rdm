<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';

	export let data: PageData;
</script>

<svelte:head>
    <title>Homepage | RDM</title>
</svelte:head>

<div class="h-custom flex w-full flex-col items-center justify-center p-8 md:px-24 lg:px-32">
	<h1 class="border-b border-muted pb-2 text-2xl font-semibold md:text-3xl">Real Debrid Manager</h1>
	<p class="mt-2 max-w-lg text-center">
		This is a web application that allows you to manage your Real Debrid account. You can view your
		torrents, download them, and more.
	</p>
	{#if data.isLoggedIn}
		<Button href="/app" class="mt-4 font-semibold">Go to Real Debrid Manager</Button>
	{:else}
		<Button href="/login" class="mt-4 font-semibold">Login to Real Debrid Manager</Button>
	{/if}
	<small class="mt-2 max-w-lg text-center">
		Source code available on <a
			href="https://github.com/ayushsehrawat/rdm"
			target="_blank"
			class="text-primary">GitHub</a
		>
	</small>
	<small class="max-w-lg text-center"
		>This project is not affiliated with Real Debrid and no data is stored/logged on the server.</small
	>
</div>
