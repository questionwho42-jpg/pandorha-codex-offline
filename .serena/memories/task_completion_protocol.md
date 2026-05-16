# Protocolo de Conclusão de Tarefa - Pandorha Engine

## Ao Finalizar Qualquer Modificação

### 1. Validar Lógica (Obrigatório)
```powershell
npm test
```

### 2. Validar Estilo (Obrigatório)
```powershell
npm run lint
```

### 3. Script de Automação Pós-Tarefa (OBRIGATÓRIO)
```powershell
python scripts/pandorha_process_automation.py
```

### 4. Self-Review Checklist
- Executar skill `self-review-checklist` antes de handoff/commit

### 5. Commit (se aprovado)
- Usar skill `git-commit` para mensagem Conventional Commits
- Garantir que Husky não rejeita o commit

### 6. Se tarefa longa ou pausada
- Executar skill `pandorha-maintenance` para snapshot e continuidade

## Verificações de Qualidade Disponíveis
```powershell
npm run quality:gate      # Gate completo
npm run quality:root      # Apenas root
npm run quality:mcp       # Apenas MCPs internos
npm run quality:skills    # Apenas skills
```

## Notas Importantes (Windows sem WSL)
- Não usar comandos bash/sh diretamente
- Scripts .sh não funcionam — usar equivalentes PowerShell/Node/Python
- npm → usar npm.cmd se necessário
