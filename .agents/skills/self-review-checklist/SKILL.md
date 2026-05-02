---
name: self-review-checklist
description: Executa checklist local de auto-revisao antes de handoff, commit ou PR, bloqueando padroes proibidos e fixtures JSON invalidas.
version: 1.0.0
---

# Self Review Checklist

Use esta skill antes de finalizar uma tarefa, principalmente quando houver alteracao em codigo, documentacao de processo, MCPs ou skills.

## Quality Gate

- Rodar os scripts locais contra fixtures de sucesso e falha.
- Manter wrappers compativeis com Windows quando Bash/WSL nao estiver disponivel.
- Rejeitar padroes proibidos antes do commit.
