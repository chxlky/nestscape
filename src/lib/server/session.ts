import type { Cookies, RequestEvent } from "@sveltejs/kit";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { db } from "./db";
import { eq } from "drizzle-orm";
import * as table from "$lib/server/db/schema";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const sessionCookieName = "auth-session";

export async function getUserFromSession(cookies: Cookies): Promise<table.User | null> {
	const sessionToken = cookies.get(sessionCookieName);
	if (!sessionToken) {
		return null;
	}

	const { user } = await validateSessionToken(sessionToken);
	return user;
}

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: number) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(table.sessionTable).values(session);
	return session;
}

export async function validateSessionToken(token: string): Promise<{
	session: table.Session | null;
	user: table.User | null;
}> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			user: {
				id: table.userTable.id,
				email: table.userTable.email,
				username: table.userTable.username,
				password: table.userTable.password, // Can be null for OAuth users
				firstName: table.userTable.firstName,
				lastName: table.userTable.lastName,
				role: table.userTable.role,
				createdAt: table.userTable.createdAt
			},
			session: table.sessionTable
		})
		.from(table.sessionTable)
		.innerJoin(table.userTable, eq(table.sessionTable.userId, table.userTable.id))
		.where(eq(table.sessionTable.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.sessionTable).where(eq(table.sessionTable.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.sessionTable)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.sessionTable.id, session.id));
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string) {
	await db.delete(table.sessionTable).where(eq(table.sessionTable.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: "/"
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: "/"
	});
}
