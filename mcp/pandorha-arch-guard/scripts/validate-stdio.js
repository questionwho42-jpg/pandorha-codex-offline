#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const serverPath = path.join(packageRoot, "src", "server.js");
const projectRoot = await fs.mkdtemp(
	path.join(os.tmpdir(), "pandorha-arch-guard-stdio-"),
);
const samplePath = path.join(
	projectRoot,
	"src",
	"features",
	"combat",
	"ui",
	"Panel.svelte",
);

await fs.mkdir(path.dirname(samplePath), { recursive: true });
await fs.writeFile(
	samplePath,
	[
		'<script lang="ts">',
		"  import { getItems } from '@/features/inventory/model/items';",
		"  let hp = $state(10);",
		"</script>",
		"",
		'<button class="bg-red-500 text-white">{hp}</button>',
	].join("\n"),
	"utf8",
);

const child = spawn(process.execPath, [serverPath], {
	cwd: packageRoot,
	env: {
		...process.env,
		PANDORHA_PROJECT_ROOT: projectRoot,
	},
	stdio: ["pipe", "pipe", "pipe"],
	windowsHide: true,
});

let buffer = "";
let initialized = false;
let toolCalled = false;

child.stdout.on("data", (chunk) => {
	buffer += chunk.toString();
	const lines = buffer.split(/\r?\n/);
	buffer = lines.pop() || "";

	for (const line of lines) {
		if (!line.trim()) continue;
		const message = JSON.parse(line);

		if (message.id === 1 && message.result) {
			initialized = true;
			console.log(
				`initialize ok: ${message.result.serverInfo.name} ${message.result.serverInfo.version}`,
			);
			send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
			continue;
		}

		if (message.id === 2 && message.result) {
			console.log(
				`tools: ${message.result.tools.map((tool) => tool.name).join(",")}`,
			);
			send({
				jsonrpc: "2.0",
				id: 3,
				method: "tools/call",
				params: {
					name: "validate_implementation",
					arguments: {
						file_path: "src/features/combat/ui/Panel.svelte",
					},
				},
			});
			continue;
		}

		if (message.id === 3 && message.result) {
			toolCalled = true;
			console.log(message.result.content?.[0]?.text || "");
			child.kill();
		}
	}
});

child.stderr.on("data", (chunk) => {
	process.stderr.write(chunk);
});

child.on("exit", () => {
	if (!initialized || !toolCalled) process.exitCode = 1;
});

send({
	jsonrpc: "2.0",
	id: 1,
	method: "initialize",
	params: {
		protocolVersion: "2024-11-05",
		capabilities: {},
		clientInfo: {
			name: "pandorha-arch-guard-validator",
			version: "0.1.0",
		},
	},
});

function send(message) {
	child.stdin.write(`${JSON.stringify(message)}\n`);
}
