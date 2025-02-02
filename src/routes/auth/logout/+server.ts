import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/session";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
	if (event.locals.session) {
		await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);
	}

	return new Response(null, { status: 204 });
};
