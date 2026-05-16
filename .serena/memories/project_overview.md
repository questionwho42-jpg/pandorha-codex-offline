# Pandorha Engine - Visão Geral do Projeto

## Propósito
Motor de RPG local-first chamado **Pandorha Engine**. É um sistema de gerenciamento de sessões de RPG de mesa com regras próprias do universo Pandorha. Roda inteiramente no browser via SQLite WASM (OPFS).

## Stack Tecnológica
- **Runtime:** Node.js (TypeScript strict)
- **Frontend:** Svelte 5 + TailwindCSS 4 (tokens fechados)
- **ORM:** Drizzle ORM (SQLite WASM — OPFS)
- **Validação:** Zod (única fonte de verdade de tipos)
- **Build:** Vite 7
- **Testes:** Vitest + @vitest/coverage-v8
- **Lint:** Biome 2 + TypeScript strict
- **DB Tools:** Drizzle-kit

## Arquitetura: Feature-Sliced Design (FSD)
Camadas (de baixo para cima):
`shared` → `entities` → `features` → `widgets` (não implementado) → `pages` (não implementado) → `app`

### Camadas Implementadas:
- **shared/**: lib/result.ts, persistence (SQLite WASM), dice, damage, resolution, action-queue, inventory, rpc
- **entities/**: ancestry, background, character, character-class, compendium, equipment, spell, world-state, world-tile
- **features/**: character-create, character-list, combat-encounter, compendium-browser, hexcrawl-map, inventory-readonly, spell-cast
- **app/**: App.svelte, sessions (character, combat, hexcrawl, inventory, spell)

## Padrões Obrigatórios
- **Result Pattern**: Nunca throw. Retornar `{ success: true, data }` | `{ success: false, error }`
- **Decorator Pattern**: Para mecânicas de jogo (bônus, modificadores, efeitos)
- **Repository Pattern**: Serviço (regras) → Repository (DB). DB injetado no Repository.
- **Fakes em Memória**: Testes usam InMemoryRepository, nunca jest.mock()
- **Named Exports Only**: Proibido export default em .ts
- **TDD Estrito**: Teste que falha ANTES da implementação. 100% em Services.

## Banco de Dados Local
- Arquivo: `dev.db` (SQLite)
- Schema gerenciado por Drizzle ORM
- SQLite WASM roda no browser via Worker

## MCPs Internos do Projeto (mcp_config.json)
1. `pandorha-docs` — filesystem MCP para docs/ e lore/
2. `sqlite-inspector` — inspeção de dev.db
3. `pandorha-knowledge` — busca de regras RPG
4. `pandorha-db-auditor` — auditoria de persistência
5. `pandorha-memory-bridge` — leitura/update de .context e memória por feature
6. `pandorha-arch-guard` — validação FSD e convenções arquiteturais
