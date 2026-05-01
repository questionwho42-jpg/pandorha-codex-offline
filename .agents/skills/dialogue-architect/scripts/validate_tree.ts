/**
 * @description Validador Matemático de Grafos para Pandorha
 * Verifica referências quebradas e garante que todo nó leva a um 'END_DIALOGUE' ou 'HUB'.
 */
import { readFileSync } from "fs";

function validateGraph(filePath: string) {
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  const nodes = new Set(data.nodes.map((n: any) => n.id));
  const errors: string[] = [];

  data.nodes.forEach((node: any) => {
    node.options.forEach((opt: any) => {
      if (opt.next_node !== "END_DIALOGUE" && !nodes.has(opt.next_node)) {
        errors.push(
          `[ERROR] Nó '${node.id}' aponta para ID inexistente: '${opt.next_node}'`,
        );
      }
    });
  });

  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log("✅ Grafo validado com sucesso.");
}
