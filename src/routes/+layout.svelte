<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	import NavBar from "$lib/components/NavBar.svelte";
	import "../app.css";

	let { children, data } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<NavBar user={data.user ?? null} />
	{@render children()}
	<Footer />
</div>
