import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const countryTable = pgTable("country", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(),
	code: text("code").notNull().unique() // ISO country code
});

export const cityTable = pgTable("city", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	countryId: integer("country_id")
		.notNull()
		.references(() => countryTable.id, { onDelete: "cascade" })
});

export const providerEnum = pgEnum("provider", ["github", "google", "microsoft"]);
export const roleEnum = pgEnum("role", ["user", "host"]);

export const userTable = pgTable("user", {
	id: serial("id").primaryKey(),
	email: text("email").notNull().unique(),
	password: text("password"), // Nullable to support OAuth users
	username: text("username").notNull(),
	firstName: text("first_name"), // Nullable
	lastName: text("last_name"), // Nullable
	role: roleEnum("role"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull()
});

export const userProvider = pgTable("user_provider", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	provider: providerEnum("provider").notNull(),
	providerId: text("provider_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull()
});

export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull()
});

export type Country = typeof countryTable.$inferSelect;
export type City = typeof cityTable.$inferSelect;
export type User = typeof userTable.$inferSelect;
export type UserProvider = typeof userProvider.$inferSelect;
export type Session = typeof sessionTable.$inferSelect;
