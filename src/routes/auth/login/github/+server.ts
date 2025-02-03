import { generateState } from "arctic";
import type { RequestHandler } from "./$types";
import { github } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
	const state = generateState();
	const url = github.createAuthorizationURL(state, ["user:email"]);

	cookies.set("github_oauth_state", state, {
		httpOnly: true,
		maxAge: 60 * 10,
		secure: import.meta.env.PROD,
		path: "/",
		sameSite: "lax"
	});

	throw redirect(302, url.toString());
};
