<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import Header from '$lib/components/app/Header.svelte';
</script>

<div class="flex flex-col gap-4 items-center w-screen h-screen font-poppins">
	{#if $page.url.pathname.startsWith('/app')}
		<Header />
	{/if}
	<div class="w-full h-full items-center justify-center flex flex-col gap-1">
		<h1 class="text-3xl font-semibold text-center">Something went wrong!</h1>
		<p class="text-base text-muted-foreground">Error code: {$page.status}</p>
		<p class="text-base text-muted-foreground">Error message: {$page.error?.message}</p>

		{#if $page.url.pathname.startsWith('/app')}
			<div class="flex flex-row flex-wrap gap-2 mt-4">
				<Button href="/app">Go back to app</Button>
				<Button href="/">Go back to homepage</Button>
			</div>
		{:else}
			<Button href="/" class="mt-4">Go back to homepage</Button>
		{/if}
		<Button
			class="mt-2"
			on:click={() => {
				window.location.reload();
			}}
			>Reload
		</Button>
	</div>
</div>

<style>
	@import '../app.postcss';
</style>
