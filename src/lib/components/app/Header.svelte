<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Logout from '$lib/components/Logout.svelte';
	import { setMode, mode } from 'mode-watcher';
	import { Sun, Moon, Loader2 } from 'lucide-svelte';
	import { page, navigating } from '$app/stores';
	import type { NavItem } from '$lib/app/types';

	const navItems: NavItem[] = [
		{
			name: 'Home',
			ref: '/app'
		},
		{
			name: 'Torrents',
			ref: '/app/torrents'
		},
		{
			name: 'Downloads',
			ref: '/app/downloads'
		},
		{
			name: 'Scraper',
			ref: '/app/scraper'
		},
		{
			name: 'Settings',
			ref: '/app/settings'
		}
	];
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
			<span class="text-xl">RDM</span>
		</a>
		<div class="flex items-center gap-8">
			<nav class="hidden lg:flex items-center gap-4">
				{#each navItems as item (item.ref)}
					<a
						class:underline={$page.url.pathname === item.ref}
						href={item.ref}
						class="hover:text-gray-900 dark:hover:text-gray-100 underline-offset-8 hover:underline"
						>{item.name}</a
					>
				{/each}
			</nav>
			<div class="flex items-center gap-2">
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
	<nav class="flex flex-wrap lg:hidden items-center gap-4 pt-8 px-4">
		{#each navItems as item (item.ref)}
			<a
				class:underline={$page.url.pathname === item.ref}
				href={item.ref}
				class="hover:text-gray-900 dark:hover:text-gray-100 underline-offset-8 hover:underline"
				>{item.name}</a
			>
		{/each}
	</nav>

	{#if $navigating}
		<div class="pt-4 w-full flex items-center justify-center text-center">
			{#if $navigating.to?.url.pathname === '/app/torrents'}
				<div class="flex items-center gap-2">
					<Loader2 class="h-4 w-4 animate-spin" />
					<p class="text-sm font-semibold">Loading Torrents</p>
				</div>
			{:else if $navigating.to?.url.pathname === '/app/downloads'}
				<div class="flex items-center gap-2">
					<Loader2 class="h-4 w-4 animate-spin" />
					<p class="text-sm font-semibold">Loading Downloads...</p>
				</div>
			{:else}
				<div class="flex items-center gap-2">
					<Loader2 class="h-4 w-4 animate-spin" />
					<p class="text-sm font-semibold">Loading...</p>
				</div>
			{/if}
		</div>
	{/if}
</header>
