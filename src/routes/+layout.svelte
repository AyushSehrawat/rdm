<script>
	import { ModeWatcher } from 'mode-watcher';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../app.postcss';
</script>

<ModeWatcher />
<SvelteToast />
<slot />
