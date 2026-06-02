# ADR-002: FSD com 4 Camadas — Omissão Intencional de pages/ e widgets/

- **ID:** ADR-002
- **Status:** Aceito
- **Data:** 2026-05-02
- **Task Ledger:** scaffold-minimo-svelte-vite

## Contexto

Feature-Sliced Design (FSD) canônico define 6 camadas: `app → pages → widgets → features → entities → shared`. Ao iniciar o projeto Pandorha Engine, avaliamos se todas as camadas faziam sentido para um jogo RPG SPA com requisitos específicos de navegação.

**Requisitos de navegação do Pandorha Engine:**
1. Nenhuma URL visível — prevenir save-scumming via botão "Voltar" do navegador
2. Navegação controlada por estado de sessão (ex: sessão de combate impede sair para mapa)
3. Telas não são páginas independentes — são estados de uma sessão complexa e interconectada
4. Muitas "telas" compartilham estado vivo (personagem atual, combate ativo, hexcrawl em progresso)

## Decisão

Usar **FSD com 4 camadas**: `app → features → entities → shared`.

- **`app/`**: Orquestrador de sessão (`App.svelte`), modelos de sessão (`app/model/`), contexto de injeção de dependência (`app/.context/`)
- **`features/`**: Fatias de domínio de negócio com lógica orquestradora, UI e testes de integração
- **`entities/`**: Domínio puro — schemas, services, repositories, fakes e testes unitários
- **`shared/`**: Infraestrutura transversal — dice, damage, resolution, action-queue, persistence, rpc, game-rules

**Motivo para omitir `pages/`:** Páginas são estados de sessão, não rotas de arquivo. Gerenciá-las como `$state` em `App.svelte` garante que transições de tela executem lógica de negócio (ex.: salvar estado antes de sair do combate).

**Motivo para omitir `widgets/`:** Componentes compostos (ex.: painel de combate com log + ações + status) pertencem à feature que os orquestra. Não há componentes compartilhados entre features suficientemente complexos para justificar uma camada separada na fase atual.

## Consequências

**Positivas:**
- Simplicidade estrutural — menos camadas = menor curvatura de aprendizado para o Codex
- Navegação state-driven nativa ao modelo mental do jogo
- Isolamento de sessão previne bugs de estado persistente entre telas

**Negativas:**
- `App.svelte` tende a crescer (atualmente 1158 linhas / 38KB) — risco de se tornar um "god component"
- Extração futura de widgets exigirá refatoração das features que hoje os contêm
- Novas features que precisam de UI cross-feature precisam ir para `shared/` (ou criar `widgets/` depois)

## Revisão Futura

Quando `App.svelte` ultrapassar 1500 linhas ou quando 3+ features compartilharem o mesmo componente UI, reavaliar a criação da camada `widgets/`.
