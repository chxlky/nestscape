import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { GitHub, Google, MicrosoftEntraId } from "arctic";
import {
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URI,
	MS_TENANT,
	MS_CLIENT_ID,
	MS_CLIENT_SECRET,
	MS_REDIRECT_URI
} from "$env/static/private";

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, null);
export const google = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
export const microsoft = new MicrosoftEntraId(MS_TENANT, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_REDIRECT_URI);

export function hashPassword(password: string): string {
	const hash = sha256(new TextEncoder().encode(password));
	return encodeHexLowerCase(hash);
}

export function comparePassword(password: string, hashedPassword: string): boolean {
	const hash = sha256(new TextEncoder().encode(password));
	const encodedHash = encodeHexLowerCase(hash);
	return encodedHash === hashedPassword;
}
