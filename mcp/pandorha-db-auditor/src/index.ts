#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

type SQLiteDatabase = ReturnType<typeof Database>;
type RowValue = string | number | bigint | Buffer | null;
type QueryParams = RowValue[] | Record<string, RowValue>;
type ActorSelector = { actor_id?: string | number; actor_name?: string };
type SaveMigrationAuditOptions = {
  current_save_version: number;
  metadata_key?: string;
  required_tables?: string[];
};

type ColumnMap = {
  id?: string;
  name?: string;
  level?: string;
  base?: string;
  hp?: string;
  ee?: string;
  axes: {
    fisico?: string;
    mental?: string;
    social?: string;
  };
  applications: {
    conflito?: string;
    interacao?: string;
    resistencia?: string;
  };
  matrix: Record<string, Record<string, string | undefined>>;
};

const AXES = ["fisico", "mental", "social"] as const;
const APPLICATIONS = ["conflito", "interacao", "resistencia"] as const;
const DEFAULT_PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const READONLY_SQL_START = /^(select|with)\b/i;
const SAFE_PRAGMA = /^pragma\s+(table_info|table_xinfo|table_list|index_list|index_info|foreign_key_list|database_list)\s*\(/i;
const BLOCKED_SQL = /\b(insert|update|delete|drop|alter|create|replace|attach|detach|vacuum|reindex|analyze|truncate)\b/i;

export function resolveDbPath(env: NodeJS.ProcessEnv = process.env): string {
  if (env.PANDORHA_DB_PATH) return path.resolve(env.PANDORHA_DB_PATH);

  const projectRoot = path.resolve(env.PANDORHA_PROJECT_ROOT || DEFAULT_PROJECT_ROOT);
  return path.join(projectRoot, "dev.db");
}

export function openDatabase(dbPath = resolveDbPath()): SQLiteDatabase {
  return new Database(dbPath, {
    readonly: false,
    fileMustExist: false
  });
}

export function createAuditor(db: SQLiteDatabase) {
  return {
    getActorStats(selector: ActorSelector) {
      const schema = inspectActorsSchema(db);
      const actor = findActor(db, schema.columns, schema.map, selector);
      const stats = normalizeActorStats(actor, schema.map);

      return {
        actor,
        stats,
        schema: {
          table: "actors",
          columns: schema.columns,
          mappedColumns: schema.map
        }
      };
    },

    verifyMath(actorId: string | number) {
      const schema = inspectActorsSchema(db);
      const actor = findActor(db, schema.columns, schema.map, { actor_id: actorId });
      const stats = normalizeActorStats(actor, schema.map);
      const missing: string[] = [];

      const base = numberFrom(stats.derived.base);
      const fisico = numberFrom(stats.axes.fisico);
      const resistencia = numberFrom(stats.applications.resistencia);
      const nivel = numberFrom(stats.derived.level);
      const storedHp = numberFrom(stats.derived.hp);

      if (base === null) missing.push("base");
      if (fisico === null) missing.push("fisico");
      if (resistencia === null) missing.push("resistencia");
      if (nivel === null) missing.push("nivel");
      if (storedHp === null) missing.push("hp");

      const hp = missing.length === 0 && base !== null && fisico !== null && resistencia !== null && nivel !== null
        ? (base + fisico + resistencia) * nivel
        : null;

      const mental = numberFrom(stats.axes.mental);
      const storedEe = numberFrom(stats.derived.ee);
      const ee = nivel !== null && mental !== null ? nivel + mental : null;

      return {
        actor: {
          id: stats.identity.id,
          name: stats.identity.name
        },
        formula: {
          hp: "HP = (Base + Fis + Res) * Nv",
          ee: "EE = Nv + Mental"
        },
        inputs: {
          base,
          fisico,
          resistencia,
          nivel,
          mental
        },
        hp: {
          stored: storedHp,
          calculated: hp,
          ok: hp !== null && storedHp !== null ? numbersMatch(storedHp, hp) : false
        },
        ee: {
          stored: storedEe,
          calculated: ee,
          ok: ee !== null && storedEe !== null ? numbersMatch(storedEe, ee) : null
        },
        ok: missing.length === 0 && hp !== null && storedHp !== null && numbersMatch(storedHp, hp),
        missing
      };
    },

    executeQuery(sql: string, params: QueryParams = []) {
      const cleanSql = normalizeSql(sql);
      if (!isReadOnlySql(cleanSql)) {
        throw new Error("execute_query accepts only read-only SELECT, WITH, or safe schema PRAGMA statements");
      }

      const prepared = db.prepare(cleanSql);
      if (!prepared.reader) {
        throw new Error("execute_query refused a non-reader SQLite statement");
      }

      return {
        sql: cleanSql,
        rows: prepared.all(params as never)
      };
    },

    auditSaveMigrationMatrix(options: SaveMigrationAuditOptions) {
      return auditSaveMigrationMatrix(db, options);
    }
  };
}

export function auditSaveMigrationMatrix(db: SQLiteDatabase, options: SaveMigrationAuditOptions) {
  const metadataKey = options.metadata_key || "system:save:primary:metadata";
  const requiredTables = options.required_tables || ["world_state_entries"];
  const existingTables = listTables(db);
  const issues: Array<{ type: string; message: string; table?: string; version?: number }> = [];

  for (const table of requiredTables) {
    if (!existingTables.includes(table)) {
      issues.push({
        type: "missing-table",
        table,
        message: `Required table '${table}' was not found.`
      });
    }
  }

  const metadata = readSaveMetadata(db, metadataKey);
  if (!metadata) {
    issues.push({
      type: "missing-save-metadata",
      message: `Save metadata '${metadataKey}' was not found.`
    });
  } else if (typeof metadata.version !== "number") {
    issues.push({
      type: "invalid-save-version",
      message: "Save metadata version is not numeric."
    });
  } else if (metadata.version > options.current_save_version) {
    issues.push({
      type: "future-save-version",
      version: metadata.version,
      message: `Save metadata version ${metadata.version} is newer than current ${options.current_save_version}.`
    });
  }

  return {
    ok: issues.length === 0,
    currentSaveVersion: options.current_save_version,
    metadataKey,
    tables: existingTables,
    metadata,
    issues
  };
}

function listTables(db: SQLiteDatabase): string[] {
  return db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all()
    .map((row) => String((row as { name: string }).name));
}

function readSaveMetadata(db: SQLiteDatabase, metadataKey: string): { version?: unknown; savedAt?: unknown } | null {
  if (!listTables(db).includes("world_state_entries")) return null;

  const row = db.prepare("SELECT value_json FROM world_state_entries WHERE key = ? LIMIT 1").get(metadataKey) as
    | { value_json?: string }
    | undefined;
  if (!row?.value_json) return null;

  try {
    const parsed = JSON.parse(row.value_json) as { version?: unknown; savedAt?: unknown };
    return parsed;
  } catch {
    return { version: "invalid-json" };
  }
}

export function inspectActorsSchema(db: SQLiteDatabase) {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get("actors");
  if (!table) {
    throw new Error("Table 'actors' was not found in the configured SQLite database");
  }

  const columns = db.prepare("PRAGMA table_info(actors)").all()
    .map((row) => String((row as { name: string }).name));

  return {
    columns,
    map: buildColumnMap(columns)
  };
}

export function buildColumnMap(columns: string[]): ColumnMap {
  const lookup = new Map(columns.map((column) => [normalizeColumn(column), column]));

  const map: ColumnMap = {
    id: pick(lookup, ["id", "actor_id", "uuid"]),
    name: pick(lookup, ["name", "nome", "actor_name"]),
    level: pick(lookup, ["level", "nivel", "nv", "lvl"]),
    base: pick(lookup, ["base", "base_hp", "hp_base"]),
    hp: pick(lookup, ["hp", "max_hp", "hp_max", "vida", "vida_maxima"]),
    ee: pick(lookup, ["ee", "energia_eterica", "energia"]),
    axes: {
      fisico: pick(lookup, ["fisico", "fis", "physical", "phys", "eixo_fisico"]),
      mental: pick(lookup, ["mental", "men", "mind", "eixo_mental"]),
      social: pick(lookup, ["social", "soc", "eixo_social"])
    },
    applications: {
      conflito: pick(lookup, ["conflito", "conflict", "aplicacao_conflito"]),
      interacao: pick(lookup, ["interacao", "interaction", "aplicacao_interacao"]),
      resistencia: pick(lookup, ["resistencia", "res", "resistance", "aplicacao_resistencia"])
    },
    matrix: {}
  };

  for (const axis of AXES) {
    map.matrix[axis] = {};
    for (const application of APPLICATIONS) {
      map.matrix[axis][application] = pick(lookup, [
        `${axis}_${application}`,
        `${axis}${application}`,
        `${application}_${axis}`
      ]);
    }
  }

  return map;
}

export function isReadOnlySql(sql: string): boolean {
  const cleanSql = normalizeSql(sql);
  if (!cleanSql || hasMultipleStatements(cleanSql)) return false;
  if (BLOCKED_SQL.test(cleanSql)) return false;
  if (/^pragma\b/i.test(cleanSql)) return SAFE_PRAGMA.test(cleanSql);
  return READONLY_SQL_START.test(cleanSql);
}

function normalizeActorStats(actor: Record<string, unknown>, map: ColumnMap) {
  return {
    identity: {
      id: valueAt(actor, map.id),
      name: valueAt(actor, map.name)
    },
    axes: {
      fisico: valueAt(actor, map.axes.fisico),
      mental: valueAt(actor, map.axes.mental),
      social: valueAt(actor, map.axes.social)
    },
    applications: {
      conflito: valueAt(actor, map.applications.conflito),
      interacao: valueAt(actor, map.applications.interacao),
      resistencia: valueAt(actor, map.applications.resistencia)
    },
    matrix: Object.fromEntries(
      AXES.map((axis) => [
        axis,
        Object.fromEntries(
          APPLICATIONS.map((application) => [
            application,
            valueAt(actor, map.matrix[axis]?.[application])
          ])
        )
      ])
    ),
    derived: {
      base: valueAt(actor, map.base),
      level: valueAt(actor, map.level),
      hp: valueAt(actor, map.hp),
      ee: valueAt(actor, map.ee)
    }
  };
}

function findActor(
  db: SQLiteDatabase,
  columns: string[],
  map: ColumnMap,
  selector: ActorSelector
): Record<string, unknown> {
  if (selector.actor_id === undefined && !selector.actor_name) {
    throw new Error("Provide actor_id or actor_name");
  }

  if (selector.actor_id !== undefined) {
    const idColumn = map.id && quoteIdentifier(map.id);
    const clauses = idColumn ? [`${idColumn} = ?`, "rowid = ?"] : ["rowid = ?"];
    const params = idColumn ? [selector.actor_id, selector.actor_id] : [selector.actor_id];
    const row = db.prepare(`SELECT * FROM actors WHERE ${clauses.join(" OR ")} LIMIT 1`).get(...params);
    if (row) return row as Record<string, unknown>;
  }

  if (selector.actor_name) {
    if (!map.name) throw new Error("Cannot search by actor_name because no name column was detected");
    const row = db.prepare(`SELECT * FROM actors WHERE ${quoteIdentifier(map.name)} = ? LIMIT 1`).get(selector.actor_name);
    if (row) return row as Record<string, unknown>;
  }

  throw new Error(`Actor not found in actors table. Available columns: ${columns.join(", ")}`);
}

function normalizeSql(sql: string): string {
  return sql.trim().replace(/;+$/g, "").trim();
}

function hasMultipleStatements(sql: string): boolean {
  let quote: "'" | "\"" | "`" | null = null;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (quote) {
      if (char === quote && next === quote) {
        index += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === "'" || char === "\"" || char === "`") {
      quote = char;
      continue;
    }

    if (char === ";") return true;
  }

  return false;
}

function pick(lookup: Map<string, string>, aliases: string[]): string | undefined {
  for (const alias of aliases) {
    const found = lookup.get(normalizeColumn(alias));
    if (found) return found;
  }

  return undefined;
}

function normalizeColumn(column: string): string {
  return column
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, "\"\"")}"`;
}

function valueAt(row: Record<string, unknown>, column?: string): unknown {
  return column ? row[column] : null;
}

function numberFrom(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function numbersMatch(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.0001;
}

/* node:coverage disable */
function jsonText(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

export async function createServer(dbPath = resolveDbPath()): Promise<{ server: McpServer; close: () => void }> {
  const db = openDatabase(dbPath);
  const auditor = createAuditor(db);
  const server = new McpServer({
    name: "pandorha-db-auditor",
    version: "0.1.0"
  });

  server.tool(
    "get_actor_stats",
    {
      actor_id: z.union([z.string(), z.number()]).optional(),
      actor_name: z.string().optional()
    },
    async (input) => jsonText(auditor.getActorStats(input))
  );

  server.tool(
    "verify_math",
    {
      actor_id: z.union([z.string(), z.number()])
    },
    async ({ actor_id }) => jsonText(auditor.verifyMath(actor_id))
  );

  server.tool(
    "execute_query",
    {
      sql: z.string().min(1),
      params: z.union([
        z.array(z.union([z.string(), z.number(), z.bigint(), z.null()])),
        z.record(z.union([z.string(), z.number(), z.bigint(), z.null()]))
      ]).optional()
    },
    async ({ sql, params = [] }) => jsonText(auditor.executeQuery(sql, params))
  );

  server.tool(
    "audit_save_migration_matrix",
    {
      current_save_version: z.number().int().min(1),
      metadata_key: z.string().optional(),
      required_tables: z.array(z.string()).optional()
    },
    async (input) => jsonText(auditor.auditSaveMigrationMatrix(input))
  );

  return {
    server,
    close: () => db.close()
  };
}

export async function main() {
  const { server, close } = await createServer();
  const transport = new StdioServerTransport();

  process.on("exit", close);
  await server.connect(transport);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error("pandorha-db-auditor failed to start", error);
    process.exit(1);
  });
}
/* node:coverage enable */
