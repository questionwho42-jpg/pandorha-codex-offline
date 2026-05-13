---
name: self-review-checklist
description: Executa checklist local de auto-revisao antes de handoff, commit ou PR, bloqueando padroes proibidos e fixtures JSON invalidas.
version: 1.0.0
---

# Self Review Checklist

Use esta skill antes de finalizar uma tarefa, principalmente quando houver alteracao em codigo, documentacao de processo, MCPs ou skills.

## Quality Gate

- Rodar os scripts locais contra fixtures de sucesso e falha.
- Usar `node .agents/skills/self-review-checklist/scripts/hard_stop.mjs <caminho>` para bloquear padroes proibidos antes de commit ou PR.
- Usar `node .agents/skills/self-review-checklist/scripts/run_json_tests.mjs <caminho>` para validar fixtures JSON.
- Manter wrappers legados compativeis quando Bash existir, mas o caminho oficial do projeto e Node/Windows-first.
- Rejeitar padroes proibidos antes do commit.
