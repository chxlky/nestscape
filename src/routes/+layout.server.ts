import { getUserFromSession } from "$lib/server/session";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ cookies }) => {
	const user = await getUserFromSession(cookies);

	return {
		user
	};
}) satisfies LayoutServerLoad;
