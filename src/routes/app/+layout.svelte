<script lang="ts">
	import Header from '$lib/components/app/Header.svelte';
</script>

<div class="flex flex-col w-full font-poppins">
	<Header />
	<slot />
</div>
