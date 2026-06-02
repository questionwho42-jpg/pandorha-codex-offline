# ADR-001: Worker RPC sem Comlink — Bridge Customizado com postMessage

- **ID:** ADR-001
- **Status:** Aceito
- **Data:** 2026-05-14
- **Task Ledger:** T33A (Worker RPC Save Contract)

## Contexto

O projeto Pandorha Engine requer comunicação entre a Main Thread (Svelte 5 UI) e um Web Worker dedicado (SQLite WASM / OPFS). A documentação inicial do SDD referenciava Comlink como biblioteca de abstração RPC. No entanto, ao avaliar os requisitos reais do projeto, ficou claro que Comlink não atendia aos requisitos de forma adequada.

**Requisitos específicos do Pandorha Engine:**
1. Audit logging de toda mensagem RPC no SQLite (tabela `rpc_audit_logs`)
2. Cancelamento de tarefas em fila via AbortSignal / mensagem de controle
3. Reporte de progresso intermediário vinculado a `messageId` (para migrações longas)
4. Pub/Sub de efeitos colaterais do Worker para a Main Thread
5. Execução batch atômica de múltiplas escritas numa única transação SQL
6. Timeout global configurável por tipo de operação (5s para operações normais, 30s para INIT_DATABASE)

Comlink trata o Worker como um proxy de módulo JavaScript e oculta o protocolo de mensagens, impedindo auditoria granular e o controle de fluxo CQRS necessário.

## Decisão

Implementar um **bridge RPC customizado** usando `postMessage` puro com o seguinte protocolo:

- Toda mensagem DEVE conter um `messageId` gerado via `crypto.randomUUID()`
- A Main Thread mantém um `Map<string, { resolve, reject, timer }>` para correlação de Promises pendentes
- O Worker espelha o `messageId` em todas as respostas (Result, Progress, Logs)
- Respostas seguem o padrão `RPCResponse<T>` com `{ messageId, success, data?, error? }`
- O Worker processa tarefas sequencialmente (fila interna) para evitar `SQLITE_BUSY`
- Schemas Zod em `src/shared/rpc/model/rpcSchemas.ts` validam todos os payloads

**Localização:** `src/shared/rpc/`, `src/shared/persistence/databaseWorkerHandler.ts`

## Consequências

**Positivas:**
- Controle total sobre serialização, correlação, timeouts e audit logging
- Suporte nativo a Transferable Objects para zero-copy de buffers
- Cancelamento implementável via mensagem de controle `{ type: 'CANCEL', messageId }`
- Testável via `FakeWorkerService` (síncrono em memória) sem dependência do WASM

**Negativas:**
- Mais verbosidade de código que Comlink para setup inicial
- Toda nova operação requer definição de schema Zod + handler no Worker
- `databaseWorkerHandler.ts` é complexo (33KB) — leitura necessária antes de modificar

## Alternativas Consideradas

| Opção | Prós | Contras |
|:---|:---|:---|
| **Comlink** | API simples de proxy | Sem audit, sem controle de fluxo, sem cancelamento granular |
| **Bridge customizada (escolhida)** | Controle total, auditável | Mais código |
| **SharedArrayBuffer + Atomics** | Zero latência | Requer `Cross-Origin-Isolation`, complexidade alta, sem suporte em OPFS |
