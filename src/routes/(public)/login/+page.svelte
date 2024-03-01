<script lang="ts">
	import type { PageData } from './$types';
	import { MoveUpRight, Loader2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { getCredentials, getAccessToken } from '$lib/rd';

	export let data: PageData;

	let loading: boolean = false;
	const deviceCode: string | undefined = data.device_code;
	const userCode: string | undefined = data.user_code;

	let pollingInterval: any;

	async function startLogin(): Promise<void> {
		loading = true;

		if (userCode) {
			navigator.clipboard.writeText(userCode);
			toast.success('Code copied to clipboard');

			pollingInterval = setInterval(pollForToken, 5000);

			window.open(data.direct_verification_url, '_blank');
		}
	}

	async function pollForToken(): Promise<void> {
		console.log('Polling for token...');

		try {
			const credentials = await getCredentials(fetch, deviceCode || '');
			const accessToken = await getAccessToken(
				fetch,
				credentials.client_id,
				credentials.client_secret,
				deviceCode || ''
			);

			if ('error' in accessToken) {
				console.log('Token not avaiilable yet...');
			} else {
				const resp = await fetch('/api/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						accessToken: accessToken.access_token,
						refreshToken: accessToken.refresh_token,
						clientId: credentials.client_id,
						clientSecret: credentials.client_secret,
						expiresIn: accessToken.expires_in
					})
				});

				if (resp.ok) {
					toast.success('Logged in successfully');
					loading = false;
					clearInterval(pollingInterval);
					window.location.href = '/';
				} else {
					console.error('Error saving access token');
					toast.error('Error saving access token');
				}
			}
		} catch (error) {
			console.error(error);
			toast.error('Error getting access token');
			clearInterval(pollingInterval);
		}
	}
</script>

<svelte:head>
	<title>Login | RDM</title>
</svelte:head>

<div class="h-custom flex w-full flex-col items-center justify-center gap-4 p-8 md:px-24 lg:px-32">
	{#if data.user_code}
		<h2 class="text-2xl font-bold">Real Debrid Login</h2>
		<div class="flex flex-wrap items-center justify-center gap-2">
			{#each data.user_code.split('') as char, i}
				<div class="rounded-md border border-muted p-4 text-lg">
					{char}
				</div>
			{/each}
		</div>
		<Button
			size="sm"
			variant="outline"
			on:click={async () => {
				await startLogin();
			}}
		>
			Copy code and go to Real Debrid
			{#if loading}
				<Loader2 class="ml-2 size-4 animate-spin" />
			{:else}
				<MoveUpRight class="ml-2 size-4" />
			{/if}
		</Button>
	{:else}
		<p class="text-red-400">Error! No user code.</p>
	{/if}
</div>
