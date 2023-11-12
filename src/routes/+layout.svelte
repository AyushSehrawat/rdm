<script>
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	import '../app.postcss';
</script>

<ModeWatcher />
<Toaster richColors closeButton />
<slot />
