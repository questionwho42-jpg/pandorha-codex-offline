/**
 * CLI Bridge para a Service Layer do World State Manager.
 * @description Garante validação Zod estrita antes do envio RPC para o Web Worker.
 */
import { z } from "zod";
import { parseArgs } from "util";
// Imports simulados do ecossistema Pandorha
import { WorkerRPC } from "../../../src/shared/WorkerRPC";
import { fsmRules } from "../references/fsm_schemas";
import { aclPolicies } from "../references/acl_policies.json";

const args = parseArgs({
  options: {
    action: { type: "string" },
    namespace: { type: "string" },
    key: { type: "string" },
    value: { type: "string" },
  },
  allowPositionals: true,
});

const action = args.positionals[0];

// Zod Strict Mode - Previne alucinação de parâmetros
const GetStateSchema = z
  .object({
    namespace: z
      .string()
      .regex(
        /^[a-z_]+:[a-z_]+:\*$/,
        "Erro: Exigido padrão Drill-Down (ex: domínio:subdomínio:*)",
      ),
  })
  .strict();

const SetFlagSchema = z
  .object({
    key: z
      .string()
      .regex(
        /^(location|npc|plot):[a-z_]+:[a-z_]+$/,
        "Erro de ACL: Acesso permitido apenas a namespaces narrativos.",
      ),
    value: z.string().refine((val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, "Erro: Value deve ser um JSON serializado válido."),
  })
  .strict();

async function main() {
  try {
    if (action === "get_domain_state") {
      const data = GetStateSchema.parse({ namespace: args.values.namespace });
      // Aciona o Auto-Seed internamente se vazio, auditado no rpc_audit_logs
      const result = await WorkerRPC.query("WORLD_STATE_GET", data);
      console.log(JSON.stringify(result, null, 2));
    } else if (action === "set_narrative_flag") {
      const data = SetFlagSchema.parse({
        key: args.values.key,
        value: args.values.value,
      });

      // Validação FSM (Guardrail)
      const parsedValue = JSON.parse(data.value);
      if (data.key.startsWith("npc:")) {
        const currentState = await WorkerRPC.query("WORLD_STATE_GET_SINGLE", {
          key: data.key,
        });
        if (
          !fsmRules.npc_status.transitions[currentState?.status]?.includes(
            parsedValue.status,
          )
        ) {
          console.log(
            JSON.stringify({
              success: false,
              error: `FSM_VIOLATION: Transição inválida de '${currentState?.status}' para '${parsedValue.status}'.`,
              allowed_transitions:
                fsmRules.npc_status.transitions[currentState?.status],
            }),
          );
          process.exit(1);
        }
      }

      // Executa o Upsert via Fila Sequencial do Worker. Dispara EVENT_BUS na UI.
      const result = await WorkerRPC.execute("WORLD_STATE_UPSERT", data);
      console.log(
        JSON.stringify({ success: true, transactionId: result.auditId }),
      );
    }
  } catch (error) {
    // Retorno estruturado para o Codex acionar autocorreção
    console.log(
      JSON.stringify({ success: false, error: error.errors || error.message }),
    );
    process.exit(1);
  }
}
main();
