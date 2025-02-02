import type { PageServerLoad } from "./$types";

export const load = (async ({ url }) => {
	const city = url.searchParams.get("city");
	
	return {};
}) satisfies PageServerLoad;
