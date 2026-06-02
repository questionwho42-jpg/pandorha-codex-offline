---
title: "Pandorha Engine - Core Conventions"
description: "Strict Architectural Contract and Coding Guidelines for AI Agents (Codex/GPT)"
version: "2.0.0"
enforcement: "Strict / Blocking"
updated: "2026-05-31"
---

# 📜 PANDORHA ENGINE: CORE CONVENTIONS
> **PRIME DIRECTIVE FOR AI AGENTS:** You are operating in a deterministic, Local-First RPG Engine (Svelte 5 + SQLite WASM). Do not hallucinate imports. Do not invent Tailwind colors. Do not bypass the Drizzle ORM. Any deviation from this document will result in compilation failure and rejected commits via git hooks.

## 1. Estrutura e Modularidade (Feature-Sliced Design)
- **Camadas Ativas:** O projeto usa 4 camadas FSD: `app → features → entities → shared`. As camadas `pages` e `widgets` são **intencionalmente omitidas** — navegação é state-driven em `App.svelte`.
- **Diretórios Estritos:** O código deve ser organizado por domínios de negócio em `src/features/<nome-da-feature>/` ou `src/entities/<nome-da-entidade>/` conforme o domínio pertence a uma feature orquestradora ou a uma entidade de domínio.
- **Isolamento Absoluto:** Uma feature não pode importar arquivos internos de outra feature diretamente. A comunicação inter-domínios é feita EXCLUSIVAMENTE via `EventBusService` (Padrão Pub/Sub) ou pelo `App.svelte` como orquestrador de sessão.
- **Tipografia e Nomes de Arquivo:**
  - Pastas: `kebab-case` (ex: `combat-system`)
  - Classes, Serviços e Componentes: `PascalCase` (ex: `CombatService.ts`, `HeroView.svelte`)
  - Utilitários e Constantes: `camelCase` (ex: `constants.ts`)
- **Proibição de Default Exports:** NUNCA use `export default` em arquivos TypeScript. Use apenas **Named Exports** (ex: `export class Name { ... }`). Componentes `.svelte` são a única exceção.

## 2. Reatividade e UI (Svelte 5)
- **Container / Presenter Pattern:** A UI deve ser dividida rigorosamente.
  - *Containers (Smart):* Fazem injeção de dependência, gerenciam estado, tratam lógica.
  - *Presenters (Dumb):* Apenas recebem `props`, disparam eventos e contêm classes CSS. Nenhuma lógica de negócio no Presenter.
- **Uso de Runes:**
  - O Estado do domínio DEVE ser encapsulado em **Classes de Serviço Reativas** (ex: `class HeroService { hp = $state(10) }`)  ou nos modelos de sessão em `src/app/model/`.
  - **PROIBIDO State Syncing:** NUNCA use a rune `$effect` para atualizar um estado baseado em outro. Efeitos colaterais (`$effect`) são estritamente para manipulação de DOM/APIs nativas.
  - Para valores derivados (ex: Carga baseada nos itens), use OBRIGATORIAMENTE `$derived`.
- **Injeção de Dependência (Pure DI):** Consuma serviços usando Wrappers Tipados da Context API (ex: `getCombatService()`). Não use singletons globais exportados de módulos.

## 3. Dados, Persistência e Validação (Local-First)
- **Database-First (Fonte da Verdade):** O schema do banco de dados definido no **Drizzle ORM** é a única fonte da verdade. Schemas vivem em `src/entities/<entidade>/infrastructure/`.
- **Projeto SPA Vite Puro:** O projeto **não usa SvelteKit**. Não existem arquivos `+layout.ts`, `+page.server.ts` ou qualquer construção SSR. Todo carregamento de dados ocorre no cliente via `SqliteOpfsBootstrapService` dentro de um Web Worker dedicado.
- **Tipagem Automática:** Tipos TypeScript e validações de fronteira devem ser inferidos nativamente via `drizzle-zod`.
- **Validação de Entrada:** Todo dado que entra em um Serviço deve ser validado via Schema Zod (`schema.parse()`) antes do processamento.
- **Padrão Repository Estrito:** Regras de negócio residem no *Service*. Operações de banco de dados (`db.select()`, `db.insert()`) residem isoladas no *Repository*. O banco (`db`) é injetado no Repository, que é injetado no Service.

## 4. Comunicação e Tratamento de Erros
- **Padrão Result/Either:** PROIBIDO usar `throw new Error()` para regras de negócio e validações. Todos os métodos de Serviço devem retornar um objeto tipado: `{ success: true, data: T } | { success: false, error: string/E }`. A UI deve checar `success` antes de renderizar. O helper `ok()` / `fail()` está em `src/shared/lib/result.ts`.
- **Observabilidade Rigorosa:** Não use `console.log()` solto. Erros críticos e lógicas complexas devem ser enviados para um `LoggerService` que escreve no SQLite interno (Caixa Preta do jogo).
- **Sem Magic Numbers:** Todo balanceamento de RPG (DCs, limites de carga, multiplicadores) DEVE ser extraído para `src/shared/game-rules.ts` (`PANDORHA_RULES`).

## 5. Estilização e Design System
- **TailwindCSS Fechado:** NÃO utilize cores padrão do Tailwind (ex: `text-red-500`). Use exclusivamente os tokens estritos definidos no `tailwind.config.ts` baseados no Styleguide (ex: `bg-void`, `text-bone`, `border-ether`).
- **Proibido CSS Nativo:** Não use blocos `<style>` nativos nos arquivos `.svelte` a menos que seja para animações complexas não suportadas pelo Tailwind.

## 6. Qualidade, Testes e Documentação Interna
- **Test-Driven Development (TDD):** Cobertura de 100% exigida nos arquivos `*Service.ts` e nas 55 unidades registradas em `vitest.config.mjs`.
  - Mocks Injetados: Teste o domínio passando Fakes (`FakeRepository`, `FakeEventBus`) via construtor. Não instancie o SQLite WASM no ambiente de teste do Vitest.
  - Padrão de Fake: `InMemoryCharacterRepository`, `CharacterBuilder` são os modelos de referência.
- **Documentação de Código (JSDoc):** Use JSDoc focado em regras de negócio para métodos e classes.
  - Exemplo: `/** @description Aplica dano bruto. @rule Capítulo 03 - Dano mitigado pela RD. */`
- **Git Workflow & Linting:** O projeto utiliza **git hooks customizados em Node.js** — não usa Husky. Hooks estão em `scripts/hooks/post-commit` e `scripts/hooks/post-merge`. Para instalar: `node scripts/install_process_hooks.mjs`. O código deve passar por todas as verificações de formatação (`npm run lint`) e de testes unitários (`npm test`) localmente antes do commit.