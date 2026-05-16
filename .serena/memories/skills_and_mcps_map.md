# Mapa de Skills e MCPs - Pandorha Engine

## MCPs Externos (disponíveis no ambiente Antigravity)
- `serena` — Ferramentas de código (find_symbol, replace_content, etc.)
- `context-mode` — Execução batch, indexação, busca
- `chromadb-pandorha` — Base vetorial do projeto
- `json-to-toon-mcp-server` — Conversão JSON→TOON para economia de tokens
- `mcpv` — Roteador de ferramentas MCP
- `telegram-bot` — Bridge para Telegram

## MCPs Internos do Projeto (mcp_config.json em pandorha sistema 28-04)
| MCP | Função | Quando usar |
|-----|--------|-------------|
| `pandorha-knowledge` | Busca regras RPG em docs/ e lore/ | Antes de implementar qualquer regra RPG |
| `pandorha-arch-guard` | Valida FSD, runes, imports | Em toda mudança de código .ts/.svelte |
| `pandorha-db-auditor` | Audita banco, schema, Drizzle | Antes de migrations/repositories |
| `pandorha-memory-bridge` | Lê/atualiza .context de features | Em novas features com continuidade |
| `pandorha-docs` | Lê docs/ e lore/ via filesystem MCP | Alternativa à leitura direta |
| `sqlite-inspector` | Inspeciona dev.db | Quando envolve banco real |

## Skills do Projeto (.agents/skills/)
| Skill | Quando usar |
|-------|-------------|
| `core-conventions` | Em quase toda mudança de código |
| `pandorha-maintenance` | Início, pausa, fechamento de tarefa |
| `build-test-verify` | Gates de build, testes e cobertura |
| `self-review-checklist` | Antes de commit/handoff |
| `character-builder` | Features de ficha/personagem |
| `magic-validator` | Mudanças em magias/metamagia |
| `monster-factory` | Criaturas e encontros |
| `hexcrawl-generator` | Exploração e mapa hexcrawl |
| `dialogue-architect` | Diálogos, NPCs, árvores narrativas |
| `world-state-manager` | Estado de mundo, eventos, clocks |
| `crafting-engine` | Forja/crafting explícito do usuário |
| `ai-docs-formatter` | Padronização de docs gerados por IA |
| `api-contract-tester` | APIs HTTP e contratos OpenAPI |
| `git-commit` | Mensagens Conventional Commits |
| `create-pull-request` | Criação de PRs com pre-flight |
| `skill-creator` (não local) | Criar novas skills |

## Template de Reporte de Ferramentas (obrigatório por tarefa)
```
Ferramentas úteis detectadas:

Vou usar agora:
- `nome`: motivo concreto.

Úteis, mas fora do escopo:
- `nome`: motivo para adiar.

Não usadas e motivo:
- `nome`: por que não agrega valor nesta tarefa.
```
