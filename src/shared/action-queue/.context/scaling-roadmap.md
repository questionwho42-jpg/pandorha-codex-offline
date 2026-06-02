# Action Queue Scaling Roadmap

## Proximos Passos

- Criar CommandProcessor real quando combate ou magia tiverem comandos concretos.
- Adicionar middlewares para condicoes, furtividade, sinergia e validacoes de item antes da execucao.
- Persistir o ledger de eventos em SQLite/OPFS quando o boundary de save estiver pronto.
- Integrar a fila com TurnFSM para impedir resolucoes imediatas fora da ActionQueue.
- Avaliar processor assíncrono apenas quando Worker/RPC entrar no escopo.
