# ADR-003: Vite Puro em vez de SvelteKit

- **ID:** ADR-003
- **Status:** Aceito
- **Data:** 2026-05-02
- **Task Ledger:** scaffold-minimo-svelte-vite, navegacao-state-driven-inicial

## Contexto

Svelte 5 pode ser usado tanto com SvelteKit (framework de aplicação com SSR/SSG/file-based routing) quanto com Vite puro (bundler sem opinião sobre roteamento). Ao iniciar o projeto, avaliamos qual abordagem se adequava melhor ao Pandorha Engine.

**Características do Pandorha Engine que guiaram a decisão:**

1. **Local-first / Offline-first**: SQLite WASM via OPFS só funciona no contexto do browser. SSR nunca pode acessar o banco do usuário.
2. **Sem URLs**: O design exige que não existam URLs navegáveis — botão "Voltar" deve ser bloqueado para prevenir save-scumming.
3. **Estado de sessão complexo**: Combate ativo, hexcrawl em progresso, alocações de camp — tudo é estado de sessão, não de rota.
4. **Single Page, não Multi Page**: O jogo é uma experiência contínua, não uma coleção de páginas com estado independente.
5. **OPFS requer contexto cliente**: Tentar inicializar SQLite WASM em `+page.server.ts` causaria erros irrecuperáveis.

## Decisão

Usar **Vite puro** com `@sveltejs/vite-plugin-svelte`. O projeto é uma **SPA standalone** sem SvelteKit.

**Estrutura resultante:**
- `index.html` — ponto de entrada único
- `src/main.ts` — bootstrapping da aplicação
- `src/app/App.svelte` — componente raiz e roteador de estado
- `vite.config.mjs` — configuração mínima com plugins svelte + tailwindcss

**O que NÃO existe (e nunca deve existir):**
- Arquivos `+page.svelte`, `+layout.ts`, `+page.server.ts`
- `export const ssr = false` (irrelevante sem SvelteKit)
- Rotas de arquivo
- Prerendering ou SSG

## Consequências

**Positivas:**
- Zero overhead de SSR — `SqliteOpfsBootstrapService` inicializa sem guardas de ambiente
- Bundle mais simples — sem adapter SvelteKit, sem chunks de servidor
- Controle total sobre o ciclo de vida da aplicação
- PWA via Service Worker simples em `public/sw.js`

**Negativas:**
- SEO limitado (jogo não precisa de SEO)
- Sem roteamento declarativo — toda navegação é imperativa em `App.svelte`
- Deploy: servidor deve servir `index.html` para qualquer path (configuração de SPA)

## Alternativas Consideradas

| Opção | Prós | Contras |
|:---|:---|:---|
| **SvelteKit** | File-based routing, SSR, adapters | SSR incompatível com OPFS/WASM; save-scumming possível |
| **Vite puro (escolhido)** | Simples, sem SSR, SPA pura | Sem roteamento declarativo |
| **Astro + Svelte** | Ilhas de hidratação | Complexidade desnecessária para jogo SPA |
