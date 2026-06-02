import path from "node:path";
import { validateTargets } from "../../core-conventions/scripts/validate.mjs";

const targets =
	process.argv.length > 2 ? process.argv.slice(2) : [path.resolve("src")];

const result = await validateTargets(targets);
if (result.success) {
	console.log("self-review hard stop passed");
} else {
	console.error(result.error);
	process.exit(1);
}
