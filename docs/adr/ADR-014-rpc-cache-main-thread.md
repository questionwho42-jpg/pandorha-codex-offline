# ADR-014: RPC Cache Global na Thread Principal

## Status
Accepted — 2026-06-04

## Contexto
O Pandorha Engine utiliza um Web Worker dedicado para toda a persistência SQLite via bridge RPC customizado (ADR-001). Cada leitura de estado requer uma mensagem postMessage ao Worker e aguarda resposta assíncrona, introduzindo latência perceptível (> 50ms em leituras sequenciais de UI reativa).

Durante a Fase 54, o perfil de latência foi medido: operações de leitura frequentes (estado do personagem, relógios de progresso, inventário) disparadas por eventos Svelte `$derived` resultavam em atualizações de UI com delay visível ao jogador.

## Decisão
Implementar um cache em memória na thread principal (`src/shared/rpc/model/rpcCache.ts`) que armazena as últimas respostas do Worker para chaves de leitura frequente. O cache é invalidado de forma pessimista: toda operação de escrita RPC invalida as entradas relacionadas antes de propagar ao Worker.

## Consequências
### Positivas
- Latência de leitura reduzida para < 16ms (de > 50ms) para estado frequentemente acessado
- UI reativa do Svelte 5 (`$derived`) recebe dados síncronos na maioria dos casos
- Compatível com o bridge RPC existente (ADR-001) sem alteração de protocolo

### Negativas
- Janela de dados stale entre invalidação de escrita e confirmação OPFS: risco de leitura de dado desatualizado em < 16ms
- Toda nova operação de escrita RPC deve explicitamente invalidar chaves do cache — ausência de invalidação cria bugs silenciosos
- GM Sandbox (Fase 57/59), por realizar mutação direta de estado via RPC, contorna a camada de serviço normal e requer invalidação manual de cache após cada operação

## Alternativas Consideradas
- **Sem cache:** Manter latência > 50ms; inaceitável para UI de jogo em tempo real
- **Memoização por componente:** Cada componente Svelte manteria seu próprio cache local — fragmentação, inconsistência entre componentes
- **Comlink (já rejeitado — ADR-001):** Não aplicável

## Relação com Outras Decisões
- Depende de ADR-001 (RPC Bridge customizado)
- Afeta a GM Sandbox (Fase 57/59): operações de mutação direta de estado devem sempre invalidar o rpcCache antes de retornar para garantir consistência
