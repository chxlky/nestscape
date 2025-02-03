import type { OAuth2Tokens } from "arctic";
import type { RequestHandler } from "./$types";
import { github } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/session";
import { userProvider, userTable } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
	const storedState = event.cookies.get("github_oauth_state") ?? null;
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");

	if (storedState === null || code === null || state === null) {
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
		tokens = await github.validateAuthorizationCode(code);
	} catch (error) {
		console.error(error);
		return new Response("Failed to validate the authorization code. Please try again.", {
			status: 400
		});
	}

	const githubAccessToken = tokens.accessToken();
	const githubUserResponse = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${githubAccessToken}`
		}
	});
	const githubUser: GitHubUser = await githubUserResponse.json();

	const existingLinkedUser = await db
		.select()
		.from(userProvider)
		.where(
			and(
				eq(userProvider.provider, "github"),
				eq(userProvider.providerId, githubUser.id.toString())
			)
		)
		.leftJoin(userTable, eq(userProvider.userId, userTable.id))
		.limit(1);

	if (existingLinkedUser.length > 0) {
		// Linked user already exists - handle login and create session
		const user = existingLinkedUser[0].user;
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, user!.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		throw redirect(302, "/dashboard");
	} else {
		// Linked user does not exist - handle registration and create session
		const githubEmailResponse = await fetch("https://api.github.com/user/emails", {
			headers: {
				Authorization: `Bearer ${githubAccessToken}`
			}
		});

		const githubEmail: GitHubEmail[] = await githubEmailResponse.json();
		const primary = githubEmail.find((email) => email.primary);

		if (!primary) {
			return new Response("Primary email not found.", { status: 400 });
		}

		const existingUserByEmail = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, primary.email))
			.limit(1);

		if (existingUserByEmail.length > 0) {
			// User exists but is not linked - handle linking the account
			const user = existingUserByEmail[0];
			await db.insert(userProvider).values({
				userId: user.id,
				provider: "github",
				providerId: githubUser.id.toString()
			});

			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, user.id);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);

			throw redirect(302, "/dashboard");
		} else {
			// Create a new user and link provider
			const [firstName, ...lastNameParts] = (githubUser.name ?? githubUser.login).split(" ");
			const lastName = lastNameParts.join(" ");

			const [newUser] = await db
				.insert(userTable)
				.values({
					email: primary.email,
					username: githubUser.login,
					firstName: firstName || null,
					lastName: lastName || null,
					role: "user"
				})
				.returning();

			await db.insert(userProvider).values({
				userId: newUser.id,
				provider: "github",
				providerId: githubUser.id.toString()
			});

			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, newUser.id);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);

			throw redirect(302, "/dashboard");
		}
	}
};

type GitHubUser = {
	id: number;
	login: string;
	name: string;
};

type GitHubEmail = {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: string | null;
};
