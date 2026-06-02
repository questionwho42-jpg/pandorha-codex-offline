---
title: "Pandorha Engine - System Design Document"
version: "2.0"
status: "Consolidado — Atualizado 2026-05-31"
stack: "Svelte 5 / TypeScript / SQLite WASM / Drizzle ORM / Vite"
---

# PROJETO: PANDORHA DIGITAL ENGINE
> **Status:** Arquitetura de Software Consolidada (v2.0)
> **Stack Base:** Svelte 5 / TypeScript / SQLite WASM / Drizzle ORM / Vite

---

## 1. Fundação Tecnológica e Persistência
- **Frontend Framework:** Svelte 5 (Tipagem estrita via TypeScript).
- **Gerenciamento de Estado UI:** Paradigma de reatividade moderna via Svelte Runes (`$state`, `$derived`, `$effect`).
- **Banco de Dados (A Fonte da Verdade):** SQLite compilado para WebAssembly (WASM).
- **Data Access Layer:** Drizzle ORM para queries 100% tipadas end-to-end.
- **Armazenamento Físico (Save Game):** OPFS (Origin Private File System) executado em Web Worker dedicado para I/O de altíssima performance.
- **Distribuição de Assets:** PWA (Progressive Web App) com Service Workers (Cache API) garantindo que o jogo, as artes e os sons funcionem 100% offline após o primeiro carregamento.
- **Build Tool:** Vite puro (sem SvelteKit). O projeto é uma **SPA standalone** — não existem rotas de arquivo, `+page.server.ts` ou SSR. Todo carregamento de dados ocorre no cliente via `SqliteOpfsBootstrapService`.

## 2. Padrões de Engenharia de Código
- **Estrutura do Repositório:** Feature-Sliced Design (FSD) com 4 camadas: `app → features → entities → shared`. As camadas `pages` e `widgets` são **intencionalmente omitidas** — a navegação é controlada por estado em `App.svelte`, não por roteamento baseado em arquivo.
- **Injeção de Dependência:** Manual por Construtor (Pure DI) instanciada na raiz e distribuída via `Context API` do Svelte para facilitar a criação de Mocks nos testes.
- **Padrão de Comunicação (Main-to-Worker):** RPC customizado com `postMessage` estruturado. A Main Thread rastreia Promises pendentes via `Map<messageId, { resolve, reject, timer }>` com timeouts de 5s (30s para `INIT_DATABASE`). Não é usada nenhuma biblioteca externa de proxy RPC.
- **Sincronização de Estado:** Imperativa (Service-Driven). A lógica executa a gravação no SQLite via Drizzle e, na mesma função, atualiza as variáveis reativas do Svelte correspondentes.
- **Tratamento de Erros:** Padrão Result/Monads. Funções retornam objetos `{ success: boolean, data?: T, error?: string }` para garantir que exceções sejam tratadas explicitamente. **Proibido `throw new Error()`** para regras de negócio.
- **Validação de Runtime:** `Zod`. Todo JSON de entidade (Bestiário, Magias) deve ser inspecionado pelo Zod antes de ser instanciado, prevenindo falhas silenciosas de integridade.
- **Migração de Dados (Save Upgrades):** Migrações nativas do Drizzle ORM executadas durante o *bootstrapping* inicial para proteger saves antigos contra mudanças de esquema. Schemas em `src/shared/persistence/model/`.

## 3. Comportamento do Motor e Interface
- **Roteamento (View Management):** Router Customizado State-Driven (sem manipulação de URLs). Telas navegam através da troca de variáveis `$state` em `App.svelte`, bloqueando *save scumming* via navegador.
- **Tempo e Sequenciamento:** Fila de Apresentação Desacoplada (Presentation Event Queue). Cálculos no backend são resolvidos instantaneamente; o Log de combate processa eventos na UI com delays programados.
- **Internacionalização (i18n):** Abordagem Híbrida. Textos de UI vivem em arquivos JSON estáticos (alta velocidade); *Lore* e descrições do Compêndio vivem em colunas no SQLite (buscas dinâmicas).
- **Gerenciamento de DOM (Log):** Auto-Trimming. O histórico visual no Svelte mantém no máximo 100 nós, destruindo os mais antigos para poupar RAM. O histórico completo vive seguro no SQLite.
- **Observabilidade (Logs):** `LoggerService` persistente no SQLite para rastreamento de erros lógicos, com buffer circular de emergência no `localStorage` em caso de falha crítica do VFS.

## 4. Núcleo Matemático de Pandorha
- **Cálculo de Atributos/Modificadores:** Dinâmico On-The-Fly. Os modificadores ativos não são gravados no banco de dados como valores finais absolutos; o motor recalcula o total a cada interação utilizando o `$derived` do Svelte para evitar estados fantasmas.
- **Sistema de Rolagens (RNG):** `DiceService` centralizado em `src/shared/dice/`. Nenhuma parte do código usa `Math.random()` diretamente. Toda rolagem passa pela classe de Serviço para gerar um log de "Auditoria de Dados" guardado no banco.
- **Estratégia de QA (Testes):** TDD focado exclusivamente na Camada de Serviços. Cobertura de 100% exigida via `Vitest` para regras de negócio (dano, carga, condições, metamagia). A camada visual (Svelte) não terá testes E2E ou de DOM automatizados.
- **Constantes Matemáticas:** Centralizadas em `src/shared/game-rules.ts` (`PANDORHA_RULES`). Nenhum número mágico deve existir no código da UI ou dos serviços.

## 5. Mecânicas de Jogo — Padrões de Design
- **Decorator Pattern (Obrigatório para mecânicas):** Bônus de atributos, modificadores de dano, efeitos de status e recuperações de acampamento são implementados como Decorators que envolvem o componente base. Exemplos: `StatusEffectDecorator`, `CraftingDamageDecorators`, `recoveryDecorators`.
- **ActionQueue (Fila de Ação):** Pilha LIFO para interrupções + Fila FIFO para sequenciamento. O `CommandProcessor` consome a fila e aplica o pipeline de middlewares de Condição e Sinergia.
- **SpellCastBuilder:** Padrão Builder que valida Draft → Weaving → Audit → Commit antes de gerar o comando imutável de conjuração.

---

> **Nota para o Codex:** Ao implementar novos serviços no Worker, utilize o padrão `Map<string, { resolve, reject, timer }>` para rastrear as Promises pendentes e gerenciar os timeouts globais de 5s. Consulte `src/shared/rpc/` para os schemas Zod e o modelo de resposta `RPCResponse<T>`.