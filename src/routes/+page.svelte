<script lang="ts">
	import { goto } from "$app/navigation";
	import type { City } from "$lib/server/db/schema";
	import { LoaderCircle, Search } from "lucide-svelte";

	let search = $state("");
	let isDropdownOpen = $state(false);
	let citiesPromise = $state<Promise<City[]> | null>(null);

	function gotoExplore(city: string) {
		goto(`/explore?city=${encodeURIComponent(city)}`);
	}

	async function fetchCities(query: string): Promise<City[]> {
		if (query.length < 1) {
			return [];
		}

		const res = await fetch(`/api/city?q=${encodeURIComponent(query)}`);
		if (!res.ok) {
			throw new Error("Failed to fetch cities");
		}

		return await res.json();
	}

	$effect(() => {
		if (search.length > 0) {
			citiesPromise = fetchCities(search);
		} else {
			citiesPromise = null;
		}
	});

	const features = [
		{
			title: "Verified Homes",
			description: "Every home is verified for quality and comfort",
			icon: "🏠"
		},
		{
			title: "24/7 Support",
			description: "Round-the-clock assistance for hosts and guests",
			icon: "💬"
		},
		{
			title: "Best Prices",
			description: "Find the perfect stay for your budget",
			icon: "💰"
		}
	];

	const destinations = [
		{
			city: "Paris",
			image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34"
		},
		{
			city: "Tokyo",
			image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8"
		},
		{
			city: "New York",
			image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9"
		}
	];

	const stats = [
		{ number: "1M+", label: "Happy Guests" },
		{ number: "50K+", label: "Verified Homes" },
		{ number: "100+", label: "Countries" }
	];
</script>

<div class="min-h-screen">
	<!-- Hero Section -->
	<div class="relative h-[600px] bg-gray-900">
		<div class="absolute inset-0">
			<img
				src="https://images.unsplash.com/photo-1501785888041-af3ef285b470"
				alt="Hero background"
				class="size-full object-cover opacity-40" />
		</div>
		<div class="relative mx-auto max-w-7xl px-4 pt-32 text-center sm:px-6 lg:px-8">
			<h1 class="mb-6 text-4xl font-bold text-white md:text-6xl">Find your perfect Escape</h1>
			<p class="mb-8 text-xl text-gray-200">
				Discover unique homes and experiences around the world
			</p>
			<div class="mx-auto max-w-2xl">
				<div class="relative flex items-center rounded-full bg-white p-2 shadow-lg">
					<input
						type="text"
						placeholder="Where are you going?"
						class="w-full rounded-full px-6 py-2 focus:outline-none"
						bind:value={search}
						onfocus={() => (isDropdownOpen = true)}
						onblur={() => (isDropdownOpen = false)}
						onkeydown={(e) => {
							if (e.key === "Enter" && search.length > 0) {
								gotoExplore(search);
							}
						}} />

					<button
						onclick={() => {
							if (search.length > 0) {
								gotoExplore(search);
							}
						}}
						class="ml-2 flex items-center justify-center rounded-full bg-rose-500 px-6 py-2 text-white transition-colors hover:bg-rose-600">
						<Search class="size-5" />
					</button>

					{#if isDropdownOpen && search.length > 0}
						<div
							class="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl bg-white shadow-lg">
							{#if citiesPromise}
								{#await citiesPromise}
									<div class="flex items-center justify-center px-6 py-3">
										<LoaderCircle class="size-6 animate-spin" />
									</div>
								{:then cities}
									{#if cities.length === 0}
										<div class="px-6 py-3 text-gray-500">No cities found</div>
									{:else}
										{#each cities as city}
											<button
												class="w-full px-6 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
												onmousedown={() => {
													search = city.name;
													gotoExplore(city.name);
												}}>
												{city.name}, {city.countryId}
											</button>
										{/each}
									{/if}
								{:catch error}
									<div class="px-6 py-3 text-center text-red-500">
										<p>Failed to fetch cities</p>
										<p>Error: {error}</p>
									</div>
								{/await}
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div class="bg-white py-24">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="mb-16 text-center">
				<h2 class="text-3xl font-bold text-gray-900">Why Choose Nestscape</h2>
			</div>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				{#each features as feature}
					<div class="p-6 text-center">
						<div class="mb-4 text-4xl">{feature.icon}</div>
						<h3 class="mb-2 text-xl font-semibold">{feature.title}</h3>
						<p class="text-gray-600">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Popular Destinations -->
	<div class="bg-gray-50 py-24">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<h2 class="mb-16 text-center text-3xl font-bold text-gray-900">Popular Destinations</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				{#each destinations as destination}
					<div class="group relative h-72 overflow-hidden rounded-lg">
						<img
							src={destination.image}
							alt={destination.city}
							class="h-full w-full object-cover transition-transform group-hover:scale-110" />
						<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
							<div class="absolute bottom-6 left-6">
								<h3 class="text-xl font-bold text-white">{destination.city}</h3>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Stats Section -->
	<div class="bg-white py-24">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
				{#each stats as stat}
					<div>
						<div class="mb-2 text-4xl font-bold text-rose-500">{stat.number}</div>
						<div class="text-gray-600">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- CTA Section -->
	<div class="bg-rose-500 py-24">
		<div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
			<h2 class="mb-8 text-3xl font-bold text-white">Ready to become a host?</h2>
			<p class="mb-8 text-xl text-white/90">
				Join thousands of hosts earning extra income by sharing their space
			</p>
			<button
				onclick={() => goto("/host")}
				class="rounded-full bg-white px-8 py-4 text-lg font-semibold text-rose-500 hover:bg-gray-100">
				Start Hosting Today
			</button>
		</div>
	</div>
</div>
