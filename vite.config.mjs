import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), svelte()],
	worker: {
		format: "es",
	},
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
