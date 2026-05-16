# Comandos Sugeridos - Pandorha Engine

## Ambiente: Windows (sem WSL). Use PowerShell/Node/Python — não Bash.

## Dev / Build / Preview
```powershell
npm run dev          # Inicia servidor Vite local (localhost:5173)
npm run build        # Build de produção
npm run preview      # Preview do build em 127.0.0.1
```

## Banco de Dados (Drizzle)
```powershell
npm run db:generate            # Gera migrations Drizzle
npm run db:migration:test      # Roda teste de migração específico
```

## Testes
```powershell
npm test                       # Todos os testes (vitest run)
npm run test:unit              # Alias para npm test
npm run test:coverage          # Testes com cobertura JSON
```

## Lint / Qualidade
```powershell
npm run lint                   # Biome check + tsc --noEmit
npm run quality:gate           # Gate completo (root+mcp+skills+automation+release)
npm run quality:root           # Gate apenas root
npm run quality:mcp            # Gate apenas MCPs
npm run quality:skills         # Gate apenas skills
npm run quality:automation     # Gate apenas automação
npm run quality:release        # Gate de release
```

## Automação / Processo
```powershell
npm run automation:doctor      # Valida setup de automação Python
npm run automation:hooks       # Instala hooks de processo
python scripts/pandorha_process_automation.py   # Script pós-tarefa OBRIGATÓRIO
```

## Scaffolding
```powershell
npm run scaffold:catalog-entity   # Cria nova entidade de catálogo
npm run scaffold:domain-service   # Cria novo domain service
```
