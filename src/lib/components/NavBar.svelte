<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import type { User } from "$lib/server/db/schema";

	let open = $state(false);

	async function logout() {
		const res = await fetch("/auth/logout", { method: "POST" });

		if (res.ok) {
			await invalidateAll();
			goto("/");
		}
	}

	let { user }: { user: User | null } = $props();
</script>

<nav class="z-50 w-full bg-white shadow-md">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<div class="flex-shrink-0">
				<a href="/" class="flex items-center">
					<span class="text-2xl font-bold text-rose-500">nestscape</span>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden items-center space-x-4 md:flex">
				<a href="/explore" class="rounded-md px-3 py-2 text-gray-700 hover:text-rose-500">
					Explore
				</a>
				<a href="/homes" class="rounded-md px-3 py-2 text-gray-700 hover:text-rose-500">
					Homes
				</a>
				{#if user !== null}
					<a
						href="/dashboard"
						class="rounded-md px-3 py-2 text-gray-700 hover:text-rose-500">
						Dashboard
					</a>
					<button
						class="rounded-md px-3 py-2 text-gray-700 hover:text-rose-500"
						onclick={logout}>
						Logout
					</button>
				{:else}
					<button
						class="text-gray-700 hover:text-rose-500"
						onclick={() => goto("/auth/login")}>
						Login
					</button>
				{/if}
			</div>

			<!-- Mobile menu button -->
			<div class="md:hidden">
				<button
					onclick={() => (open = !open)}
					class="text-gray-700 hover:text-rose-500"
					aria-label="Toggle mobile menu">
					<svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if open}]
		<div class="md:hidden">
			<div class="space-y-1 px-2 pb-3 pt-2 sm:px-3">
				<a
					href="/explore"
					class="block rounded-md px-3 py-2 text-gray-700 hover:text-rose-500">
					Explore
				</a>
				<a
					href="/homes"
					class="block rounded-md px-3 py-2 text-gray-700 hover:text-rose-500">
					Homes
				</a>
				{#if user !== null}
					<a
						href="/dashboard"
						class="block w-full rounded-md px-3 py-2 text-left text-gray-700 hover:text-rose-500">
						Dashboard
					</a>
					<button
						class="block w-full rounded-md px-3 py-2 text-left text-gray-700 hover:text-rose-500"
						onclick={logout}>
						Logout
					</button>
				{:else}
					<button
						class="block w-full rounded-md px-3 py-2 text-left text-gray-700 hover:text-rose-500"
						onclick={() => goto("/auth/login")}>
						Login
					</button>
				{/if}
			</div>
		</div>
	{/if}
</nav>
