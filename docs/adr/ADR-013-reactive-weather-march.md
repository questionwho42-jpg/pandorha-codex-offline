# ADR-013: Processamento Reativo Centralizado de Efeitos de Clima Extremo no Hexcrawl

- **ID:** ADR-013
- **Status:** Aceito
- **Data:** 2026-06-04
- **Task Ledger:** N/A (Fase de Planejamento)

## Contexto

A Fase 72 introduz o Clima Extremo regional, controlado por Relógios de Progresso globais, que afeta a velocidade de marcha, consome provisões e impõe exaustão biológica aos Andarilhos se viajarem expostos sem abrigos adequados. Em um jogo tradicional, esse impacto poderia ser persistido como um efeito de status ativo físico na ficha do Andarilho (`status_effects`). No entanto, em um jogo local-first offline que roda no navegador, gravar e deletar efeitos de status a cada travessia de hexágono ou mudança climática de região geraria I/O redundante e volumoso de banco de dados SQLite via RPC, podendo prejudicar o desempenho reativo.

## Decisão

Adotar a **Alternativa A (Processamento Reativo Centralizado por Middleware de Marcha)**:

1. **Modificadores Reativos Derivados:** As penalidades de Clima Extremo ativo sobre os atributos dos Andarilhos e custos de marcha são aplicadas dinamicamente de forma reativa on-the-fly (`$derived` no Svelte 5) com base no clima do WorldTile atual, sem criar linhas físicas na tabela de status effects do Andarilho.
2. **Cálculo de Exaustão por Ticks de Viagem:** O `HexcrawlMovementService` avalia a presença de Clima Extremo e a ausência de abrigos de viagem durante ticks de movimentação, acumulando incrementalmente os níveis da *Cascata de Exaustão* biológica dos Andarilhos diretamente no banco apenas quando a ação de viagem é efetivada.
3. **Resolução de Condições Climáticas:** Efeitos permanentes de clima são tratados centralizadamente na reatividade do `CharacterDerivedStatsService`, garantindo que a UI mostre os atributos recalculados instantaneamente ao pisar em um hexágono sob tempestade biomecânica.

## Consequências

**Positivas:**
- **Eficiência e Performance:** Reduz significativamente gravações desnecessárias no SQLite local via RPC no Web Worker durante o deslocamento no hexcrawl.
- **UI Responsiva e Viva:** O jogador sente o impacto no momento exato em que entra em um hexágono sob clima severo (a barra de marcha e os atributos atualizam dinamicamente on-the-fly).
- **Sem Estados Fantasmas:** Garante que a limpeza de clima ocorra de forma determinística ao sair do hexágono ou ao expirar o Progress Clock regional.

**Negativas:**
- **Complexidade de Derivação:** O `CharacterDerivedStatsService` precisa monitorar o estado geográfico do hexcrawl para computar os atributos do Andarilho, acoplando levemente o domínio de sobrevivência e movimentação.

## Alternativas Consideradas

| Opção | Prós | Contras |
|:---|:---|:---|
| **Reativo Derivado (Escolhida)** | Sem gravações redundantes de banco, UI 100% responsiva ao mapa, dados limpos. | Acoplamento geográfico sutil no recalculador de atributos derivados. |
| **Status Effect Persistido** | Reutiliza gaveta de UI de status existente e lógica de debuffs comuns. | Alto volume de gravações de banco desnecessárias no SQLite a cada hexágono cruzado. |
| **Auditoria ao Fim de Turno** | Loop de movimento super simples, reduz cálculos em tempo real. | Baixa imersão; jogador viaja na tempestade sem sentir penalidades imediatas até o fim do ciclo de 6h. |
