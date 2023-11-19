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
	import type {
		DeviceCodeResponse,
		CredentialsResponse,
		AccessTokenResponse,
		UserResponse,
		APIResponse
	} from '$lib/app/types';
	import { toast } from 'svelte-sonner';

	export let data;
	let userCode: string;
	let deviceCode: string;
	let loading = false;
	let pollingInterval: NodeJS.Timeout;

	async function startLogin(): Promise<void> {
		loading = true;
		try {
			const res = await fetch('/api/rd/generateClient');
			const data: APIResponse<DeviceCodeResponse> = await res.json();

			if (!data.success) {
				alert('Error getting user code from Real Debrid..');
				return;
			}

			userCode = data.data ? data.data.user_code : '';
			deviceCode = data.data ? data.data.device_code : '';

			navigator.clipboard.writeText(userCode);
			pollingInterval = setInterval(pollForToken, 5000);
		} catch (e) {
			alert('Error getting user code from Real Debrid..');
		}
	}

	async function getClientData() {
		const res = await fetch(`/api/rd/getClientData?deviceCode=${deviceCode}`);
		const data: APIResponse<CredentialsResponse> = await res.json();
		return data;
	}

	async function getAccessToken(clientId: string, clientSecret: string) {
		const res = await fetch(`/api/rd/token`, {
			method: 'POST',
			body: JSON.stringify({
				clientId: clientId,
				clientSecret: clientSecret,
				code: deviceCode
			})
		});
		const data: APIResponse<AccessTokenResponse> = await res.json();
		return data;
	}

	async function doLogin(
		accessToken: string,
		refreshToken: string,
		clientId: string,
		clientSecret: string,
		expiresIn: number
	) {
		const res = await fetch('/api/login', {
			method: 'POST',
			body: JSON.stringify({
				accessToken: accessToken,
				refreshToken: refreshToken,
				clientId: clientId,
				clientSecret: clientSecret,
				expiresAt: Date.now() + expiresIn * 1000,
				expiresIn: expiresIn
			})
		});
		const data: APIResponse = await res.json();
		return data;
	}

	async function pollForToken(): Promise<void> {
		try {
			const clientData = await getClientData();
			if (!clientData.success) {
				alert('Error polling for token from Real Debrid.. Logging out.');
				return;
			}
			clearInterval(pollingInterval);

			const clientId: string = clientData.data ? clientData.data.client_id : '';
			const clientSecret: string = clientData.data ? clientData.data.client_secret : '';

			const tokenData = await getAccessToken(clientId, clientSecret);
			if (!tokenData.success) {
				alert('Error getting access token from Real Debrid.. Logging out.');
				return;
			}
			const expiresIn = tokenData.data ? tokenData.data.expires_in : 0;
			const accessTokenData = await doLogin(
				tokenData.data ? tokenData.data.access_token : '',
				tokenData.data ? tokenData.data.refresh_token : '',
				clientId,
				clientSecret,
				expiresIn
			);
			if (!accessTokenData.success) {
				alert('Error saving token from Real Debrid.. Logging out.');
				return;
			}
			loading = false;
			invalidateAll();
		} catch (error) {
			alert('Error polling for token from Real Debrid.. Logging out.');
		}
	}

	let userData = async function getUserData() {
		const res = await fetch('/api/user');
		const data: APIResponse<UserResponse> = await res.json();

		if (!data.success) {
			toast.error('Error getting user data..');
			return;
		}

		return data;
	};
</script>

<svelte:head>
	<title>Real Debrid Manager | Easily manage your torrents and downloads</title>
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
				<img alt="avatar" class="rounded-full h-24 w-24" src={data?.data?.avatar} />
				<p class="text-lg font-semibold text-black dark:text-white">{data?.data?.username}</p>
				<p>{data?.data?.email}</p>
				<p>Premium expires on {formatDate(data?.data ? data.data.expiration : '')}</p>
				<p>{data?.data?.points} points</p>
			</div>
		{:catch error}
			<p class="text-red-500">Error getting user data.. {error?.message}</p>
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
