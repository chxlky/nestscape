import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { cityTable } from "$lib/server/db/schema";
import { like } from "drizzle-orm";

export const GET: RequestHandler = async ({url}) => {
	try {
		const query = url.searchParams.get("q") || "";

		if (query.length < 1) {
			return json([]);
		}

		const cities = await db
			.select()
			.from(cityTable)
			.where(like(cityTable.name, `%${query}%`))
			.limit(10)
			.orderBy(cityTable.name);

		return json(cities);
	} catch (error) {
		console.error(error);
		return json({ error: "An error occurred" }, { status: 500 });
	}
};
