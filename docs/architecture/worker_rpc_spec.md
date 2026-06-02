````markdown
---
title: "Worker RPC Specification - Pandorha Engine"
version: "1.0.0"
status: "Finalized"
architecture: "CQRS + Worker-Side Queuing"
transport: "postMessage (Structured Clone) + Transferables"
concurrency_model: "Dedicated Worker / Sequential Task Queue"
validation: "Zod Shared Schemas"
testing: "Proxy Injection / Fake Synchronous Worker"
---

# 🛰️ Worker RPC Specification: The Pandorha Bridge

Este documento estabelece o contrato rígido de comunicação entre a **Main Thread (UI/Svelte 5)** e o **Web Worker (SQLite/Drizzle/OPFS)**. Ele foi desenhado para garantir determinismo absoluto na geração de código por LLMs (OpenAI Codex/GPT-5.5) e estabilidade sistêmica para o motor de RPG Pandorha.

## 1. Fundamentos Arquiteturais

### 1.1 Padrão CQRS Estrito

A comunicação é dividida em dois fluxos claros:

- **Commands:** Mutação de estado (escrita). São funções de domínio de alto nível no Worker (ex: `HealHero`).
- **Queries:** Leitura de estado. Permitem flexibilidade total via Drizzle ORM, mas são tratadas como operações de leitura pura.

### 1.2 O Objeto de Resposta (Padrão Monad/Result)

O Worker **nunca** dispara exceções para a Main Thread. Falhas são tratadas como dados.

```typescript
type RPCResponse<T> = {
  messageId: string; // UUID v4 correlacionado
  success: boolean;
  data?: T;
  error?: {
    code: string; // ex: 'SQLITE_BUSY', 'VALIDATION_ERROR', 'RPC_TIMEOUT'
    message: string;
    details?: any;
  };
};
```
````

## 2. Protocolo de Mensagem (Constraints)

### 2.1 Fronteira de Serialização (DTOs de Primitivos)

- **Proibido:** Instâncias de classes, funções, `Map`, `Set` ou referências de memória.
- **Permitido:** `string`, `number`, `boolean`, `null`, e objetos/arrays literais.
- **Datas:** Devem ser transmitidas obrigatoriamente como strings em formato **ISO 8601**.
- **Binários:** Utilizar **Transferable Objects** (`ArrayBuffer`, `Uint8Array`) para zero-copy.

### 2.2 Identificação e Correlação

- Toda mensagem enviada DEVE conter um `messageId` gerado via `crypto.randomUUID()`.
- O Worker deve espelhar o `messageId` em todas as respostas (Results, Progress e Logs).

## 3. Gestão de Fluxo e Concorrência

### 3.1 Inicialização (Explicit Handshake)

A UI deve permanecer em estado de "Loading" até que o comando explícito de inicialização retorne sucesso.

- **Comando:** `INIT_DATABASE`.
- **Responsabilidades:** Carregamento de WASM, montagem do OPFS e **Migrações Automáticas de Esquema**.
- **Timeout:** 30 segundos (contra 5 segundos para operações normais).

### 3.2 Fila Sequencial e Concorrência

O Worker gerencia uma fila interna de tarefas. Múltiplas mensagens recebidas são processadas sequencialmente para evitar conflitos de trava de escrita (`SQLITE_BUSY`).

### 3.3 Cancelamento (AbortSignal)

O wrapper RPC deve suportar a `Abort Web API`.

- Ao abortar na Main Thread, uma mensagem de controle `{ type: 'CANCEL', messageId: '...' }` é enviada.
- Se a tarefa ainda estiver na fila do Worker, ela é descartada sem execução.

## 4. Eficiência e Performance

### 4.1 Batch Execution (`BATCH_EXECUTE`)

Operações múltiplas de escrita devem ser enviadas em lote.

- O Worker abre uma **transação SQL única** para o lote.
- Garantia de **Atomicidade**: Sucesso total ou Rollback total em caso de erro em qualquer item.

### 4.2 Paginação Obrigatória

Consultas que retornam coleções de dados DEVEM incluir obrigatoriamente:

- `limit`: Máximo de 100 registros por chamada.
- `offset`: Ponto de partida da leitura.

### 4.3 Reporte de Progresso

Operações de longa duração (Migrações, Backups) emitem mensagens intermediárias vinculadas ao `messageId` original:

```json
{
  "type": "PROGRESS",
  "messageId": "UUID",
  "percentage": 75,
  "status": "Migrating..."
}
```

## 5. Reatividade e Observabilidade

### 5.1 Pub/Sub (Event Bus)

O Worker emite notificações de efeitos colaterais para a Main Thread:

```json
{
  "type": "EVENT",
  "event": "ENTITY_UPDATED",
  "payload": { "entity": "HERO", "id": 42 }
}
```

A Main Thread utiliza esses eventos para invalidar Runes do Svelte 5 e forçar o re-fetch de dados afetados.

### 5.2 Auditoria (Audit Ledger)

Toda mensagem RPC processada é registrada automaticamente no SQLite na tabela interna `rpc_audit_logs`, permitindo depuração pós-mortem e telemetria.

## 6. Validação de Contrato (Zod)

O arquivo `src/shared/rpc/model/rpcSchemas.ts` contém a definição Zod de todos os comandos e queries.

- O Worker deve executar `schema.parse(payload)` antes de interagir com o Drizzle.
- Falhas de validação retornam um `success: false` com o código `VALIDATION_ERROR`.

## 7. Estratégia de Teste (RPC Isolation)

Para garantir 100% de cobertura nos serviços da Main Thread sem a dependência do ambiente assíncrono do Worker:

- **Mocking:** Injetar um `FakeWorkerService` via construtor (Pure DI).
- **Comportamento:** O `FakeWorker` executa a lógica de banco em memória de forma **Síncrona**, simulando as respostas RPC instantaneamente.

---

> **Diretriz para o Codex:** Ao implementar o `WorkerBridge`, utilize um `Map<string, { resolve, reject, timer }>` para rastrear as Promises pendentes e gerenciar os timeouts globais de 5s.

```

```
