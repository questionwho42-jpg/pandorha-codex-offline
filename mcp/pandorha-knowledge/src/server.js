#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { resolveConfig } from "./config.js";
import { loadKnowledgeIndex } from "./search-engine.js";

const config = resolveConfig();
const indexPromise = loadKnowledgeIndex(config);

const server = new McpServer({
  name: "pandorha-knowledge",
  version: "0.1.0"
});

server.tool(
  "search_rpg_rule",
  {
    term: z.string().min(2).describe("Termo de busca para regras, tabelas ou lore de Pandorha."),
    limit: z.number().int().min(1).max(10).optional().describe("Numero maximo de resultados, de 1 a 10.")
  },
  async ({ term, limit = 5 }) => {
    const index = await indexPromise;
    const result = index.searchRpgRule(term, { limit });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "map_rule_evidence",
  {
    query: z.string().min(2).describe("Termo para mapear evidencia rastreavel sem interpretar regra."),
    include: z.array(z.string()).optional().describe("Caminhos relativos permitidos, como docs/system/magic."),
    exclude: z.array(z.string()).optional().describe("Caminhos relativos a ignorar."),
    limit: z.number().int().min(1).max(10).optional().describe("Numero maximo de evidencias.")
  },
  async ({ query, include = [], exclude = [], limit = 10 }) => {
    const index = await indexPromise;
    const result = index.mapRuleEvidence(query, { include, exclude, limit });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

try {
  const transport = new StdioServerTransport();
  await server.connect(transport);
} catch (error) {
  console.error("pandorha-knowledge failed to start", error);
  process.exit(1);
}
