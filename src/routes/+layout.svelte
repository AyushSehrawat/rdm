<script lang="ts">
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import NProgress from 'nprogress';
	import Header from '$lib/components/header.svelte';
	import { setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { page } from '$app/stores';

	const openNavbar: Writable<boolean> = writable(false);
	setContext('openNavbar', openNavbar);

	beforeNavigate(() => {
		NProgress.start();
	});
	afterNavigate(() => {
		NProgress.done();
	});
	NProgress.configure({
		showSpinner: false
	});
</script>

<ModeWatcher />
<Toaster richColors closeButton />

<div class="flex flex-col font-primary">
	{#if $page.url.pathname.startsWith('/app')}
		<Header />
	{/if}
	<slot />
</div>
