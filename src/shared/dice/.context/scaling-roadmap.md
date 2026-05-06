# Dice Scaling Roadmap

## Proximos Passos

- Criar `ResolutionService` na T19 consumindo `DiceService.rollD20` para aplicar a formula universal de teste.
- Adicionar um adaptador isolado de RNG real apenas quando houver boundary aprovado para runtime, evitando uso direto de aleatoriedade no dominio.
- Persistir `auditEntry` em SQLite/OPFS quando o projeto introduzir log auditavel de sessao.
- Ampliar os tipos de auditoria para incluir actor, source, target e rule reference quando combate e magia precisarem rastrear causalidade.
