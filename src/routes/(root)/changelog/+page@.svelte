<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import clsx from 'clsx';

	interface Change {
		type: string;
		description: string;
	}

	interface Changelog {
		date: string;
		version: string;
		changes: Change[];
	}

	interface Data {
		changelog: Changelog[];
	}

	interface RootObject {
		data: Data;
	}
	export let data: RootObject;

	const changelogTypes: Record<string, string> = {
		new: 'New',
		fix: 'Fix',
		update: 'Update',
		remove: 'Remove',
		security: 'Security',
		other: 'Other'
	};
</script>

<div class="flex flex-col p-8 md:px-24 lg:px-32 gap-4 font-poppins overflow-x-hidden">
	<h1 class="text-4xl font-semibold">Changelog</h1>
    <Badge class="rounded-md max-w-max">Latest v{data.data.changelog[0].version}</Badge>
    <Separator class="mb-4" />
	<div class="py-4 flex flex-col gap-4 items-start w-full h-full">
		{#each data.data.changelog as changelog}
			<div class="gap-2 flex flex-col items-start">
				<div class="flex gap-2 flex-wrap items-center">
					<h2 class="text-2xl font-semibold">{changelog.date}</h2>
					<Badge class="rounded-md">{changelog.version}</Badge>
				</div>
				<Separator class="mb-2" />
				{#each changelog.changes as change}
					<div class="flex gap-2 break-words">
						<Button
							size="sm"
							class={clsx('rounded-md pointer-events-none min-w-[6rem]', {
								'bg-green-500': change.type === 'new',
								'bg-gray-500': change.type === 'fix',
								'bg-yellow-500': change.type === 'update',
								'bg-red-500': change.type === 'remove',
								'bg-blue-500': change.type === 'security',
								'bg-black dark:bg-white': change.type === 'other'
							})}
						>
							{changelogTypes[change.type]}
						</Button>
                        <p>{change.description}</p>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
