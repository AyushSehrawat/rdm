<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import Logout from '$lib/components/Logout.svelte';
	import { setMode, mode } from 'mode-watcher';
	import { LogIn } from 'lucide-svelte';
	import { Loader2 } from 'lucide-svelte';
	import { LayoutGrid } from 'lucide-svelte';
	import { Sun } from 'lucide-svelte';
	import { Moon } from 'lucide-svelte';
	import { formatDate } from '$lib/app/helpers';

	export let data;

	interface UserDataType {
		avatar: string;
		email: string;
		expiration: string;
		id: number;
		locale: string;
		points: number;
		premium: number;
		type: string;
		username: string;
	}

	let userCode: string;
	let deviceCode: string;
	let loading = false;
	let pollingInterval: NodeJS.Timeout;

	async function startLogin() {
		loading = true;
		try {
			const res = await fetch('/api/rd/generateClient');
			const data = await res.json();
			userCode = data.user_code;
			deviceCode = data.device_code;
			navigator.clipboard.writeText(userCode);
			pollingInterval = setInterval(pollForToken, 5000);
		} catch (e) {
			alert('Error getting user code from Real Debrid..');
		}
	}

	async function pollForToken() {
		try {
			const res = await fetch(`/api/rd/getClientData?deviceCode=${deviceCode}`);
			const data = await res.json();
			if (data.hasOwnProperty('client_id') && data.hasOwnProperty('client_secret')) {
				clearInterval(pollingInterval);
				let clientId = data.client_id;
				let clientSecret = data.client_secret;

				const tokenRes = await fetch(`/api/rd/token`, {
					method: 'POST',
					body: JSON.stringify({
						clientId: clientId,
						clientSecret: clientSecret,
						code: deviceCode
					})
				});
				const tokenData = await tokenRes.json();
				if (tokenData.hasOwnProperty('access_token') && tokenData.hasOwnProperty('refresh_token')) {
					const tokenDataSet = await fetch('/api/login', {
						method: 'POST',
						body: JSON.stringify({
							accessToken: tokenData.access_token,
							refreshToken: tokenData.refresh_token,
							clientId: clientId,
							clientSecret: clientSecret,
							expiresAt: Date.now() + tokenData.expires_in * 1000,
							expiresIn: tokenData.expires_in
						})
					});

					const tokenDataRes = await tokenDataSet.json();
					if (tokenDataRes.hasOwnProperty('success')) {
						loading = false;
						invalidateAll();
					} else {
						alert('Error logging in.. Logging out.');
					}
				} else {
					alert('Error getting access token from Real Debrid.. Logging out.');
				}
			}
		} catch (error) {
			alert('Error polling for token from Real Debrid.. Logging out.');
		}
	}

	let userData = async function getUserData() {
		const data = await fetch(`/api/user`, {
			method: 'GET'
		});

		return data.json();
	};
</script>

<svelte:head>
	<title>Real Debrid Manager</title>
	<meta name="description" content="Real Debrid Manager" />
	<meta name="keywords" content="Real Debrid Manager" />
</svelte:head>

{#if data.clientId === undefined}
	<div class="flex flex-col md:flex-row gap-4">
		<Button
			class="w-full md:max-w-max"
			disabled={loading}
			on:click={() => {
				startLogin();
			}}
		>
			{#if loading}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<LogIn class="mr-2 h-4 w-4" />
			{/if}
			Login with Real Debrid
		</Button>
		{#if $mode === 'light'}
			<Button
				class="w-full md:max-w-max"
				on:click={() => {
					setMode('dark');
				}}
			>
				<Moon class="mr-2 h-4 w-4" />
				Dark Mode
			</Button>
		{:else}
			<Button
				class="w-full md:max-w-max"
				on:click={() => {
					setMode('light');
				}}
			>
				<Sun class="mr-2 h-4 w-4" />
				Light Mode
			</Button>
		{/if}
	</div>
	{#if userCode}
		<p class="mt-2 w-full text-center">
			Your user code is: {userCode} (Copied to clipboard!). Go to
			<a
				class="underline decoration-blue-600 font-semibold"
				href="https://real-debrid.com/device"
				target="_blank">Real Debrid login.</a
			>
		</p>
	{/if}
{:else}
	<div class="flex flex-col items-center justify-center gap-4">
		{#await userData()}
			<Loader2 class="mr-2 h-8 w-8 animate-spin" />
		{:then data}
			<div
				class="flex flex-col items-center justify-center gap-4 text-gray-600 dark:text-gray-400 text-sm"
			>
				<img alt="avatar" class="rounded-full h-24 w-24" src={data.avatar} />
				<p class="text-lg font-semibold text-black dark:text-white">{data.username}</p>
				<p>{data.email}</p>
				<p>Premium expires on {formatDate(data.expiration)}</p>
				<p>{data.points} points</p>
			</div>
		{:catch error}
			<p class="text-red-500">Error getting user data..</p>
		{/await}
		<div class="flex flex-col md:flex-row items-center gap-2">
			<Button href="/app">
				<LayoutGrid class="mr-2 h-4 w-4" />
				Go To Dashboard
			</Button>
			<Logout />
			{#if $mode === 'light'}
				<Button
					class="w-full md:max-w-max"
					on:click={() => {
						setMode('dark');
					}}
				>
					<Moon class="mr-2 h-4 w-4" />
					Dark Mode
				</Button>
			{:else}
				<Button
					class="w-full md:max-w-max"
					on:click={() => {
						setMode('light');
					}}
				>
					<Sun class="mr-2 h-4 w-4" />
					Light Mode
				</Button>
			{/if}
		</div>
	</div>
{/if}
