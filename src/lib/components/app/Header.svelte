<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import Logout from '$lib/components/Logout.svelte';
	import { setMode, mode } from 'mode-watcher';
	import { Sun } from 'lucide-svelte';
	import { Moon } from 'lucide-svelte';
</script>

<header
	class="flex w-full items-center justify-between p-10 md:px-24 lg:px-32 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800"
>
	<a
		href="/"
		class="flex title-font font-medium items-center gap-2 text-gray-900 dark:text-gray-100"
	>
		<img alt="logo" src="/icon.svg" class="w-10 h-10 dark:invert" />
		<span class="text-xl hidden md:block">Real Debrid Manager</span>
		<span class="text-xl block md:hidden">RDM</span>
	</a>
	<div class="flex items-center gap-8">
		<nav class="hidden md:flex items-center gap-4">
			<a href="/app" class="hover:text-gray-900 dark:hover:text-gray-100">Home</a>
			<a href="/app/torrents" class="hover:text-gray-900 dark:hover:text-gray-100">Torrents</a>
			<a href="/app/downloads" class="hover:text-gray-900 dark:hover:text-gray-100">Downloads</a>
		</nav>
		<div class="flex items-center gap-4">
			<Logout />
			{#if $mode === 'light'}
				<Button
					class="w-full md:max-w-max"
					on:click={() => {
						setMode('dark');
					}}
				>
					<Moon class="h-4 w-4" />
				</Button>
			{:else}
				<Button
					class="w-full md:max-w-max"
					on:click={() => {
						setMode('light');
					}}
				>
					<Sun class="h-4 w-4" />
				</Button>
			{/if}
		</div>
	</div>
</header>
