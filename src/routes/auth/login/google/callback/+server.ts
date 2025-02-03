import { decodeIdToken, type OAuth2Tokens } from "arctic";
import type { RequestHandler } from "./$types";
import { google } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/session";
import { userProvider, userTable } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
	const storedState = event.cookies.get("google_oauth_state") ?? null;
	const codeVerifier = event.cookies.get("google_oauth_code_verifier") ?? null;
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");

	if (storedState === null || codeVerifier === null || code === null || state === null) {
		return new Response("Please restart the process.", {
			status: 400
		});
	}

	if (storedState !== state) {
		return new Response("Please restart the process.", {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (error) {
		console.error(error);
		return new Response("Failed to validate the authorization code. Please try again.", {
			status: 400
		});
	}

	const claims = decodeIdToken(tokens.idToken());
	const googleUser: GoogleUser = claims as GoogleUser;

	const existingLinkedUser = await db
		.select()
		.from(userProvider)
		.where(
			and(eq(userProvider.provider, "google"), eq(userProvider.providerId, googleUser.sub))
		)
		.leftJoin(userTable, eq(userProvider.userId, userTable.id))
		.limit(1);

	if (existingLinkedUser.length > 0) {
		// Linked user already exists - handle login and create session
		const user = existingLinkedUser[0].user;
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, user!.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, "/dashboard");
	} else {
		// Linked user does not exist - handle registration and create session
		const existingUserByEmail = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, googleUser.email))
			.limit(1);

		if (existingUserByEmail.length > 0) {
			// User exists but is not linked - handle linking the account
			const user = existingUserByEmail[0];
			await db.insert(userProvider).values({
				userId: user.id,
				provider: "google",
				providerId: googleUser.sub
			});

			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, user.id);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);

			throw redirect(302, "/dashboard");
		} else {
			// Create a new user and link provider
			const [newUser] = await db
				.insert(userTable)
				.values({
					email: googleUser.email,
					username: googleUser.email.split("@")[0],
					firstName: googleUser.given_name || null,
					lastName: googleUser.family_name || null,
					role: "user"
				})
				.returning();

			await db.insert(userProvider).values({
				userId: newUser.id,
				provider: "google",
				providerId: googleUser.sub
			});

			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, newUser.id);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);

			throw redirect(302, "/dashboard");
		}
	}
};

type GoogleUser = {
	sub: string;
	email: string;
	given_name: string;
	family_name: string;
};
