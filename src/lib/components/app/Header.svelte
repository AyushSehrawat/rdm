<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import Logout from '$lib/components/Logout.svelte';
	import { setMode, mode } from 'mode-watcher';
	import { Sun } from 'lucide-svelte';
	import { Moon } from 'lucide-svelte';
	import { page, navigating } from '$app/stores';
</script>

<header
	class="flex flex-col w-full items-center p-10 md:px-24 lg:px-32 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800"
>
	<div class="flex w-full items-center justify-between">
		<a
			href="/"
			class="flex title-font font-medium items-center gap-2 text-gray-900 dark:text-gray-100"
		>
			<img alt="logo" src="/icon.svg" class="w-10 h-10 dark:invert" />
			<span class="text-xl hidden lg:block">Real Debrid Manager</span>
			<span class="text-xl block lg:hidden">RDM</span>
		</a>
		<div class="flex items-center gap-8">
			<nav class="hidden lg:flex items-center gap-4">
				<a
					class:underline={$page.url.pathname === '/app'}
					href="/app"
					class="hover:text-gray-900 dark:hover:text-gray-100 underline-offset-8 hover:underline"
					>Home</a
				>
				<a
					class:underline={$page.url.pathname === '/app/torrents'}
					href="/app/torrents"
					class="hover:text-gray-900 dark:hover:text-gray-100 underline-offset-8 hover:underline"
					>Torrents</a
				>
				<a
					class:underline={$page.url.pathname === '/app/downloads'}
					href="/app/downloads"
					class="hover:text-gray-900 dark:hover:text-gray-100 underline-offset-8 hover:underline"
					>Downloads</a
				>
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
	</div>
	<nav class="flex lg:hidden items-center gap-4 pt-8 px-4">
		<a
			class:underline={$page.url.pathname === '/app'}
			href="/app"
			class="hover:text-gray-900 dark:hover:text-gray-100 underline-offset-8 hover:underline"
			>Home</a
		>
		<a
			class:underline={$page.url.pathname === '/app/torrents'}
			href="/app/torrents"
			class="hover:text-gray-900 dark:hover:text-gray-100 underline-offset-8 hover:underline"
			>Torrents</a
		>
		<a
			class:underline={$page.url.pathname === '/app/downloads'}
			href="/app/downloads"
			class="hover:text-gray-900 dark:hover:text-gray-100 underline-offset-8 hover:underline"
			>Downloads</a
		>
	</nav>

	{#if $navigating}
		<div class="pt-4 w-full flex items-center justify-center text-center">
			{#if $navigating.to?.url.pathname === '/app/torrents'}
				<p class="text-sm font-semibold">Loading Torrents...</p>
			{:else if $navigating.to?.url.pathname === '/app/downloads'}
				<p class="text-sm font-semibold">Loading Downloads...</p>
			{:else}
				<p class="text-sm font-semibold">Loading...</p>
			{/if}
		</div>
	{/if}
</header>
