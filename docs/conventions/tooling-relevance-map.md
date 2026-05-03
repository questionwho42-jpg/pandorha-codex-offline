# Tooling Relevance Map

Este documento orienta quando reportar plugins, skills, MCPs, scripts e recursos auxiliares como úteis para uma tarefa do Pandorha Engine.

## Regra De Reporte

Antes de cada tarefa, o agente deve informar em pt-BR:

- **Vou usar agora:** ferramentas que reduzem risco ou são necessárias para executar a tarefa atual.
- **Úteis, mas fora do escopo:** ferramentas relacionadas que devem ser adiadas para evitar expansão indevida.
- **Não usadas e motivo:** ferramentas que parecem relevantes, mas não serão usadas por não agregarem valor ao escopo atual.

Reporte apenas ferramentas com relação plausível com a tarefa. Não liste inventário completo por padrão.

## MCPs Pandorha

| Ferramenta | Reportar quando for útil para | Observação |
| :--- | :--- | :--- |
| `pandorha-knowledge` | Buscar regras, lore, documentação e fontes de verdade em `docs/` ou `lore/`. | Use antes de implementar regra de RPG, conteúdo de mundo ou decisão dependente de documentação. |
| `pandorha-arch-guard` | Validar arquivos `.ts` e `.svelte` contra FSD, Svelte runes e regras arquiteturais locais. | Use em mudanças de código nas camadas `app`, `features`, `entities` ou `shared`. |
| `pandorha-db-auditor` | Auditar persistência, schema, Drizzle, SQLite e consistência de banco. | Use antes de migrations, repositories e adapters reais. |
| `pandorha-memory-bridge` | Ler ou atualizar `.context` e memória tripla por feature. | Use em novas features, módulos e mudanças com continuidade futura. |
| `pandorha-docs` | Ler arquivos de documentação expostos via MCP filesystem. | Use como alternativa a leitura direta quando a tarefa pedir MCP/documentação. |
| `sqlite-inspector` | Inspecionar `dev.db` e estado SQLite local. | Use apenas quando houver banco real envolvido; evite em testes unitários com fakes. |

## Skills Pandorha

| Skill | Reportar quando for útil para | Observação |
| :--- | :--- | :--- |
| `core-conventions` | Svelte 5, TypeScript, FSD, Tailwind tokens, Result Pattern e limites de imports. | Use em quase toda mudança de código. |
| `pandorha-maintenance` | Snapshots, task ledger, checkpoints, documentação de processo e promoção pós-merge. | Use em início, pausa, fechamento e snapshots de tarefa. |
| `build-test-verify` | Gates de build, testes, cobertura e evidência de qualidade. | No Windows sem WSL, adapte comandos Bash para PowerShell/Node quando necessário. |
| `self-review-checklist` | Revisão antes de handoff, commit ou PR. | Use quando houver mudança relevante ou risco de regressão. |
| `character-builder` | Fichas, criação, validação e evolução de personagem. | Use em features de Character voltadas ao jogador. |
| `magic-validator` | Magias, metamagia, custo, tags e equilíbrio mágico. | Use apenas em mudanças de magia. |
| `monster-factory` | Criaturas, papéis táticos, bestiário e geração determinística. | Use em sistemas de monstros e encontros. |
| `hexcrawl-generator` | Hexcrawl, regiões, topografia e exploração procedural. | Use em exploração e mapa. |
| `dialogue-architect` | Diálogos, AST narrativa, flags e requisitos de HP Mental. | Use em conversas, NPCs e árvores narrativas. |
| `world-state-manager` | Estado de mundo, eventos, clocks, NPCs e continuidade narrativa. | Use quando a tarefa depender de estado persistido do mundo. |
| `crafting-engine` | Forja, materiais, ouro, tempo e coleta de item forjado. | Só use quando o usuário pedir crafting explicitamente. |
| `ai-docs-formatter` | Padronização de documentação gerada por IA. | Use em docs extensos ou documentos que precisam seguir estrutura oficial. |
| `api-contract-tester` | OpenAPI, contratos de API e validação design-first. | Use quando houver API HTTP ou contrato público. |

## Plugins

| Plugin | Reportar quando for útil para | Observação |
| :--- | :--- | :--- |
| `Browser Use` | Abrir, clicar, inspecionar e validar UI no navegador interno. | Obrigatório para features com UI ou fluxo visual em localhost. |
| `Game Studio` | Loop de jogo, UX de jogo, HUD, menus, assets, playtest e validação de experiência jogável. | Não use para Drizzle, Result Pattern ou persistência interna. |
| `GitHub` | Issues, PRs, CI remoto, review comments, publicação de branch e pull request. | Push/PR exigem confirmação explícita. |
| `Hugging Face` | Modelos, datasets, Spaces, docs de ML e tarefas remotas HF. | Útil apenas se a tarefa envolver ML ou Hugging Face. |
| `Documents` | Criar ou editar `.docx` e documentos renderizados. | Não use para Markdown simples do repositório. |
| `Spreadsheets` | Criar, editar ou analisar planilhas. | Use para CSV/XLSX, tabelas calculadas e gráficos. |
| `Presentations` | Criar ou revisar decks e apresentações. | Use apenas para PPT/PPTX ou materiais de apresentação. |

## Recursos Auxiliares

| Recurso | Reportar quando for útil para | Observação |
| :--- | :--- | :--- |
| `openai-docs` | APIs, modelos e produtos OpenAI. | Buscar fontes oficiais quando a informação puder ter mudado. |
| `imagegen` | Criar ou editar imagens, sprites, mockups ou assets visuais raster. | Não use para edição de código ou docs textuais. |
| `playwright` | Automação alternativa de navegador, screenshots e QA quando Browser Use não estiver disponível. | Se o usuário pediu Browser Use, use fallback só com justificativa. |
| `skill-creator` | Criar ou atualizar skills Codex. | Use quando a tarefa for transformar processo recorrente em skill. |
| `plugin-creator` | Criar plugin Codex local. | Use quando uma integração precisar virar plugin. |
| `skill-installer` | Instalar skills curadas ou de repositório. | Use quando a tarefa pedir uma skill ausente. |
| Skills Azure/cloud | Azure, Foundry, deploy, quota, compliance, diagnostics, RBAC e cloud. | Só reporte quando a tarefa envolver Azure ou infraestrutura cloud. |

## Template Curto

```text
Ferramentas úteis detectadas:

Vou usar agora:
- `nome`: motivo concreto.

Úteis, mas fora do escopo:
- `nome`: motivo para adiar.

Não usadas e motivo:
- `nome`: por que não agrega valor nesta tarefa.
```

## Exemplos Rápidos

- Tarefa de Drizzle repository: usar `core-conventions`, `pandorha-arch-guard`, `pandorha-db-auditor` se tocar banco real; não usar `Game Studio`.
- Tarefa de tela Svelte: usar `core-conventions`, `Browser Use`, `pandorha-arch-guard`; reportar `Game Studio` como útil se a tela afetar UX de jogo.
- Tarefa de magia: usar `pandorha-knowledge`, `magic-validator`, `core-conventions`; consultar `docs/system/magic/`.
- Tarefa de documentação longa: usar `pandorha-maintenance` e `ai-docs-formatter`; não usar Browser Use se não houver UI.
