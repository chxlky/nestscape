<script lang="ts">
	import { goto } from "$app/navigation";
	import type { PageProps } from "./$types";

	let { form }: PageProps = $props();
</script>

<div class="-mt-16 flex min-h-screen flex-col bg-gray-900 px-4">
	<div class="absolute inset-0 -mt-16">
		<img
			src="/pictures/auth background.jpg"
			alt="Auth background"
			class="h-full w-full opacity-40" />
	</div>

	<div class="flex min-h-screen flex-1 items-center justify-center px-4 backdrop-blur-sm">
		<div class="w-full max-w-md rounded-2xl bg-slate-50 p-8">
			<h2 class="mb-6 text-center text-3xl font-bold text-gray-900">
				{form?.isRegistering ? "Register" : "Login"}
			</h2>

			{#if form?.message}
				<div class="mb-2 rounded border border-red-500 bg-red-100 p-2 text-center">
					<p class="text-red-500">Error: {form?.message}</p>
				</div>
			{/if}

			<form method="POST" class="space-y-4">
				<div class="space-y-4">
					{#if form?.isRegistering}
						<div>
							<label
								for="firstName"
								class="block text-sm font-semibold text-gray-900">
								First Name
							</label>
							<input
								name="firstName"
								type="text"
								value={form?.firstName ?? ""}
								class="w-full rounded-xl bg-gray-100 px-4 py-3 focus:outline-none" />
						</div>
						<div>
							<label for="lastName" class="block text-sm font-semibold text-gray-900">
								Last Name
							</label>
							<input
								name="lastName"
								type="text"
								value={form?.lastName ?? ""}
								class="w-full rounded-xl bg-gray-100 px-4 py-3 focus:outline-none" />
						</div>
					{/if}

					<div>
						<label for="email" class="block text-sm font-semibold text-gray-900">
							Email
						</label>
						<input
							name="email"
							type="email"
							value={form?.email ?? ""}
							class="w-full rounded-xl bg-gray-100 px-4 py-3 focus:outline-none" />
					</div>
					<div>
						<label for="password" class="block text-sm font-semibold text-gray-900">
							Password
						</label>
						<input
							name="password"
							type="password"
							class="w-full rounded-xl bg-gray-100 px-4 py-3 focus:outline-none" />
					</div>

					{#if form?.isRegistering}
						<div>
							<label
								for="confirmPassword"
								class="block text-sm font-semibold text-gray-900">
								Confirm Password
							</label>
							<input
								name="confirmPassword"
								type="password"
								class="w-full rounded-xl bg-gray-100 px-4 py-3 focus:outline-none" />
							<input type="hidden" name="isRegistering" value="true" />
						</div>
					{/if}
				</div>

				<button
					type="submit"
					class="w-full rounded-lg bg-rose-500 px-4 py-2 text-lg font-semibold text-white transition hover:bg-rose-600">
					{form?.isRegistering ? "Create Account" : "Login"}
				</button>
			</form>

			<div class="relative p-4">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="bg-slate-50 px-2 text-gray-500">Or continue with</span>
				</div>
			</div>

			<div class="mt-2 flex gap-2">
				<button
					onclick={() => goto("/auth/login/github")}
					class="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-black px-4 py-2 font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
					<img src="/icons/github.svg" alt="GitHub" class="size-5" />
					GitHub
				</button>
				<button
					onclick={() => goto("/auth/login/google")}
					class="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
					<img src="/icons/google.svg" alt="Google" class="size-5" />
					Google
				</button>
			</div>
		</div>
	</div>
</div>
