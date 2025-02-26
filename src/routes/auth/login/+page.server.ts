import { db } from "$lib/server/db";
import { userTable } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { Actions } from "./$types";
import { comparePassword, hashPassword } from "$lib/server/auth";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/session";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = data.get("email")?.toString() ?? "";
		const password = data.get("password")?.toString() ?? "";
		const firstName = data.get("firstName")?.toString() ?? "";
		const lastName = data.get("lastName")?.toString() ?? "";
		const confirmPassword = data.get("confirmPassword")?.toString();
		const isRegistering = data.get("isRegistering") === "true";

		if (email === "" || password === "") {
			return fail(400, { message: "Please fill in all fields." });
		}

		const user = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
		if (user.length === 0 || (user[0] && !user[0].password)) {
			if (!isRegistering) {
				return {
					isRegistering: true,
					email,
					firstName,
					lastName,
					message:
						user.length === 0
							? "Please create an account."
							: "Please set a password for email login."
				};
			}

			if (!confirmPassword || password !== confirmPassword) {
				return fail(400, {
					isRegistering: true,
					email,
					firstName,
					lastName,
					message: "Passwords do not match."
				});
			}

			if (isRegistering && (!firstName || !lastName)) {
				return fail(400, {
					isRegistering: true,
					email,
					message: "Please provide your name."
				});
			}

			if (user.length === 0) {
				// Create new user
				const hashedPassword = hashPassword(password);
				const [newUser] = await db
					.insert(userTable)
					.values({
						email,
						password: hashedPassword,
						username: email.split("@")[0],
						firstName,
						lastName,
						role: "user"
					})
					.returning();

				const sessionToken = generateSessionToken();
				const session = await createSession(sessionToken, newUser.id);
				setSessionTokenCookie(event, sessionToken, session.expiresAt);

				throw redirect(302, "/dashboard");
			} else {
				// Set password for OAuth user
				const hashedPassword = hashPassword(password);
				await db
					.update(userTable)
					.set({ password: hashedPassword })
					.where(eq(userTable.id, user[0].id));

				const sessionToken = generateSessionToken();
				const session = await createSession(sessionToken, user[0].id);
				setSessionTokenCookie(event, sessionToken, session.expiresAt);

				throw redirect(302, "/dashboard");
			}
		}

		// Regular login
		const valid = comparePassword(password, user[0].password!);
		if (!valid) {
			return fail(400, { message: "Invalid credentials." });
		}

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, user[0].id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		throw redirect(302, "/dashboard");
	}
} satisfies Actions;
