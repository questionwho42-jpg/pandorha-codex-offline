# Convenções e Estilo - Pandorha Engine

## Nomenclatura
- Pastas: `kebab-case`
- Classes, Serviços, Componentes: `PascalCase`
- Utilitários e constantes: `camelCase`
- Arquivos: `PascalCase.ts` para classes, `camelCase.ts` para utilitários

## TypeScript
- `strict: true`, proibido `any`
- Tipos inferidos via drizzle-zod
- Validação de entrada via `schema.parse()` em todo Service
- Named exports only (exceto .svelte)

## Svelte 5
- Container/Presenter: Container = lógica + DI; Presenter = props + eventos + CSS
- Estado em Classes Reativas com `$state()`
- Valores derivados com `$derived()`
- `$effect` só para DOM/APIs nativas (nunca para sync de estado)
- DI via Context API wrappers tipados

## Tratamento de Erros
- PROIBIDO: `throw new Error()`, `console.log()` solto
- OBRIGATÓRIO: Result Pattern — `{ success: true, data } | { success: false, error }`
- Erros críticos → LoggerService → SQLite

## TailwindCSS
- NÃO usar cores padrão (ex: text-red-500)
- Usar APENAS tokens do styleguide: `bg-void`, `text-bone`, `border-ether`, etc.
- Proibido `<style>` nativo em .svelte (exceto animações complexas)

## Importações FSD
- Features NÃO importam de outras features diretamente
- Comunicação inter-feature via EventBusService (Pub/Sub)
- Shared ← Entities ← Features ← App (fluxo de dependência)

## Testes
- 100% de cobertura em *Service.ts
- InMemoryRepository para fakes (nunca jest.mock)
- Reverse TDD: teste falha primeiro
- Não instanciar SQLite WASM em testes (usar SessionCharacterRepository ou FakeWorkerBridge)

## Documentação de Código
- JSDoc focado em regras de negócio
- Exemplo: `/** @description Aplica dano bruto. @rule Cap. 03 - Dano mitigado pela RD. */`
- Sem comentários excessivos no código; criar docs externos separados

## Balanceamento de RPG
- Sem "magic numbers" — extrair para `GAME_RULES.X.Y` (src/shared/game-rules.ts)

## Git
- Husky com Biome/ESLint bloqueando commits que falhem lint/testes
- Conventional Commits (skill git-commit)
- Branches descritivas por feature
