# ADR-009: Transição de Tela e Persistência do Combate via Estado Reativo (State-Driven Session)

- **ID:** ADR-009
- **Status:** Aceito
- **Data:** 2026-06-04
- **Task Ledger:** N/A (Fase de Planejamento)

## Contexto

Ao navegar pelo hexcrawl (mapa de exploração de hexágonos), o Andarilho pode encontrar perigos que disparam encontros de combate. Em uma SPA (Single Page Application) tradicional, a transição entre a tela do mapa e o painel de combate poderia ser resolvida através de um Event Bus síncrono ou rotas de roteador puramente baseadas no lado do cliente. No entanto, em um jogo local-first offline, a resiliência é um fator crítico: se o navegador recarregar, fechar ou travar durante um combate ativo, o estado da luta seria totalmente perdido, criando uma vulnerabilidade para trapaças (*save scumming*) ou bugs na progressão da sessão do jogador.

## Decisão

Adotar a **Alternativa A (State-Driven Session)** para o controle de fluxo e transição de combate:

1. **A UI reage ao Banco de Dados:** A aba ativa exibida ao usuário (Mapa vs. Painel de Combate) é derivada de forma reativa da tabela `active_sessions` no banco SQLite local.
2. **Ciclo de Transição:**
   - O `HexcrawlMovementService` processa o movimento do Andarilho e, se um encontro de combate for gerado, atualiza o campo `combat_encounter_id` da sessão ativa no banco de dados SQLite físico.
   - O Svelte 5 (`App.svelte`), através da sincronização do banco local via Worker RPC, reage a essa mudança no estado da sessão e exibe automaticamente o painel de combate, bloqueando o acesso ao mapa de exploração.
3. **Resiliência:** Ao recarregar a página, a inicialização lê o estado do banco e renderiza diretamente o combate pendente de resolução, impedindo o encerramento do combate de forma irregular.

## Consequências

**Positivas:**
- **Segurança de Estado (Anti-Cheat):** Previne perdas de progresso acidentais e impede que o jogador reinicie o navegador para evitar um combate difícil.
- **Tolerância a Falhas:** Perfeito para o paradigma local-first offline. O combate persiste e recupera seu estado original de forma transparente.
- **Reatividade Pura:** Simplifica a lógica no componente App principal, delegando a responsabilidade do fluxo à reatividade do SQLite WASM.

**Negativas:**
- **Latência de Persistência:** Introduz uma dependência de I/O física (Main Thread -> Worker RPC -> SQLite) para concluir a transição da aba da interface visual.

## Alternativas Consideradas

| Opção | Prós | Contras |
|:---|:---|:---|
| **State-Driven Session (Escolhida)** | Previne save-scumming, resiliência total contra crashes, UX local-first sólida. | Exige I/O de banco para transição de abas. |
| **Roteador Baseado em Eventos** | Transição de UI instantânea, acoplamento zero com persistência de banco. | Estado se perde em reload, permitindo burlar encontros difíceis. |
| **Wrapper de Coordenação** | Desacopla App.svelte, cria hierarquias claras de navegação. | Aumenta a complexidade e exige tabelas adicionais para controle de fluxo. |
