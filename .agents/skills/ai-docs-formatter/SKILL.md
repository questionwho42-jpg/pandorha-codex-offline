---
name: ai-docs-formatter
description: Formata documentacao gerada por IA para o padrao estrutural do Pandorha Engine, usando schema JSON e formatter local quando disponivel.
version: 1.0.0
---

# AI Docs Formatter

Use esta skill quando uma resposta, especificacao ou documento gerado por IA precisar ser normalizado para o formato de documentacao do projeto.

## Quality Gate

- Validar `assets/response-schema.json`.
- Rodar `scripts/formatter.ts` contra fixtures pequenas antes de usar em lote.
- Preservar informacao tecnica verificavel e remover texto especulativo.
