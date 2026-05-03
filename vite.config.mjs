import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
