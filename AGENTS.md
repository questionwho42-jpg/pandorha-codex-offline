# PANDORHA ENGINE - MASTER AGENT CONTEXT (AGENTS.md)

Este arquivo define as diretrizes inegociáveis para qualquer agente de IA operando no repositório Pandorha Engine. Ele deve ser lido INTEGRALMENTE antes de qualquer modificação no código.

## 🛠 Stack Tecnológica (The Source of Truth)
- **Runtime:** Node.js
- **Linguagem:** TypeScript (Modo Estrito: `strict: true`, no `any`)
- **ORM:** Drizzle ORM
- **Validação:** Zod (Schemas Zod são a única fonte de verdade para tipos e validação de dados)
- **Banco de Dados:** Local-First via SQLite WASM (Sincronização reativa)

## 🌐 Protocolo de Idioma (pt-BR + English)
- **Usuário:** Toda comunicação com usuário, UI copy, documentação de produto, lore, regras de RPG, critérios de aceite e relatórios legíveis por humanos devem usar Português do Brasil (`pt-BR`).
- **Codex/IA:** Identificadores, APIs, nomes de módulos/arquivos quando idiomático, contratos técnicos, comentários técnicos, testes e instruções operacionais para agentes devem usar inglês.
- **Regra de Interface:** Quando um artefato servir aos dois públicos, mantenha a camada visível ao usuário em `pt-BR` e a camada de implementação em inglês.

## Task Intake and Execution Profile
Before every new feature or modification, the agent MUST inspect the relevant repository context, decide the best implementation strategy, and inform the user of the execution profile before editing files.

The execution profile MUST include:
- recommended model and reasoning effort for the task;
- whether Plan mode should be enabled;
- whether IDE context should be enabled or consulted;
- plugins, skills, and MCPs required for the task;
- project commands, configuration files, validation gates, and tools that will be used.

For small and safe changes, the profile may be concise. For broad, architectural, RPG-rule, or database-impacting changes, the profile must be explicit and must respect the pause/approval protocol in this file.

## Tooling Relevance Protocol
Before every new task, the agent MUST analyze available plugins, skills, MCPs, scripts, and auxiliary resources, then report which ones are useful for the requested work.

The report MUST be user-facing in pt-BR and separate:
- **Vou usar agora:** tools that materially improve the current task and should be activated immediately.
- **Úteis, mas fora do escopo:** tools that could help adjacent work but should not be used in the current task.
- **Não usadas e motivo:** relevant-looking tools that are intentionally skipped to avoid unnecessary scope, cost, or risk.

Each listed tool MUST include a one-sentence reason. Do not list every installed tool just because it exists; report only tools with a plausible relationship to the task. The canonical selection map is `docs/conventions/tooling-relevance-map.md`.

## Mandatory Planning Before Implementation
The agent MUST create a detailed implementation plan before starting any new feature, implementation, or meaningful modification. The plan must be specific to the current repository state and must include concrete guidance for files, architecture boundaries, tools, validation gates, and user-facing test steps when UI is involved.

The agent MUST NOT start coding before the plan exists. The agent MUST NOT create code that violates the project specifications in `AGENTS.md`, `llms.txt`, `docs/architecture/`, `docs/conventions/`, or `docs/system/`.

If the implementation appears to require anything not already planned or specified in the task scope, including a design pattern, architectural convention, skill, MCP, plugin, automation, tool, function, method, dependency, or workflow, the agent MUST stop before adopting it. The agent must explain why the extra element is needed, present more than one viable option with pros and cons, recommend the best option for Pandorha Engine, and ask the user how to proceed.

## 🏗 Arquitetura: Feature-Sliced Design (FSD)
O projeto segue o padrão FSD para garantir escalabilidade e desacoplamento.
- **Isolamento:** Nenhuma importação pode cruzar fatias (slices) ou camadas (layers) de forma ilegal.
- **Camadas Permitidas:** `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`.
- **Regra de Ouro:** Se um módulo precisa de algo de outro módulo vizinho, isso deve ser extraído para uma camada inferior (Shared ou Entities).

## 🧪 Testes e Qualidade (TDD Estrito)
- **Cobertura:** 100% de cobertura exigida em todos os **Serviços** e **Domain Logic**.
- **Reverse TDD:** Sempre escreva o teste que falha ANTES de implementar a lógica.
- **Fakes vs Mocks:** Proibido o uso de `jest.mock()` ou mocks parciais. Utilize **Fakes em Memória** (Ex: `InMemoryRepository`) para testes de unidade e integração.

## ⚠️ Tratamento de Erros: Result Pattern
É terminantemente **PROIBIDO** o uso de `throw new Error()`.
- **Implementação:** Utilize o padrão `Result<Success, Failure>` (ou `Either`).
- **Rigor:** Todas as funções que podem falhar devem retornar explicitamente um objeto de erro tipado, forçando o chamador a tratar o caso de falha.

## 🎭 Padrões de Design Obrigatórios
- **DECORATOR:** Para todas as mecânicas de jogo (bônus de atributos, modificadores de dano, efeitos de status).
  - *Manifesto:* Prefira composição sobre herança. "Envolva" o componente base para adicionar comportamentos.

## 💻 Protocolo de Execução (Comandos Fixos)
### Ambiente Local Windows
- Este projeto roda neste PC sem Ubuntu/WSL instalado por limitação do ambiente local.
- Não assuma que `bash`, scripts `.sh`, comandos Linux, pipes POSIX ou caminhos Unix funcionarão.
- Prefira PowerShell, `npm.cmd`, `node`, scripts TypeScript/JavaScript e scripts Python portáveis.
- Se uma skill ou documentação pedir Bash, registre a limitação e use o gate equivalente em PowerShell/Node/Python quando existir.

Ao trabalhar no projeto, o agente DEVE validar seu trabalho com:
1. **Validar Lógica:** `npm test`
2. **Validar Estilo:** `npm run lint` (Biome/ESLint)
3. **Check-out de Tarefa:** Ao finalizar qualquer modificação, rode obrigatoriamente o script de automação:
   ```bash
   python scripts/pandorha_process_automation.py
   ```

---
*Este documento é a âncora de contexto para a IA. Não o ignore.*
