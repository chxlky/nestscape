<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	let { user } = data;
</script>

<div>
	Welcome {user?.username}
</div>
