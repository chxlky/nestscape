import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async (event) => {
	const user = event.locals.user;

	if (!user) {
		throw redirect(302, "/auth/login");
	}

	return {
		user
	};
}) satisfies PageServerLoad;
