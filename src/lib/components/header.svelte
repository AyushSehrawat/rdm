<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import ThemeMode from '$lib/components/theme-mode.svelte';
	import type { NavItem } from '$lib/types';
	import { Menu } from 'lucide-svelte';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { goto } from '$app/navigation';

	const openNavbar: Writable<boolean> = getContext('openNavbar');

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

<header class="flex items-center justify-between border-b border-muted p-8 md:px-24 lg:px-32">
	<a href="/" class="flex items-center gap-2 font-medium">
		<img alt="logo" src="/icon.svg" class="size-10 dark:invert" />
		<span class="text-xl">RDM</span>
	</a>
	<nav class="hidden gap-8 lg:flex">
		{#each navItems as item}
			<a href={item.ref} class="font-medium underline-offset-4 hover:underline">{item.name}</a>
		{/each}
	</nav>

	<div class="flex items-center gap-4">
		<ThemeMode />
		<Drawer.Root onClose={() => openNavbar.set(false)} open={$openNavbar}>
			<Drawer.Trigger class="block lg:hidden">
				<Menu size="24" />
			</Drawer.Trigger>
			<Drawer.Content>
				<nav class="my-4 flex w-full flex-col items-center justify-center gap-2">
					{#each navItems as item}
						<Drawer.Close asChild let:builder>
							<Button
								on:click={() => {
									goto(item.ref);
								}}
								builders={[builder]}
								size="sm"
								variant="ghost">{item.name}</Button
							>
						</Drawer.Close>
					{/each}
				</nav>
			</Drawer.Content>
		</Drawer.Root>
	</div>
</header>
