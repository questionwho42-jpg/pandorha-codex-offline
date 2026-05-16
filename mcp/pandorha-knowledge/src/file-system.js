import fs from "node:fs/promises";
import path from "node:path";

export async function walkMarkdownFiles(roots) {
	const files = [];

	for (const root of roots) {
		await collectMarkdownFiles(root, files);
	}

	return files.sort((a, b) => a.localeCompare(b));
}

async function collectMarkdownFiles(root, files) {
	let entries;

	try {
		entries = await fs.readdir(root, { withFileTypes: true });
	} catch (error) {
		if (error?.code === "ENOENT") return;
		throw error;
	}

	entries.sort((a, b) => a.name.localeCompare(b.name));

	for (const entry of entries) {
		if (entry.isSymbolicLink()) continue;

		const fullPath = path.join(root, entry.name);

		if (entry.isDirectory()) {
			await collectMarkdownFiles(fullPath, files);
			continue;
		}

		if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
			files.push(fullPath);
		}
	}
}

export async function readUtf8File(filePath) {
	return fs.readFile(filePath, "utf8");
}
