# ADR-018: Arquitetura do Motor de Eventos Globais de Campanha e Regras de Campanha Toggleable

## Status
Accepted — 2026-06-13

## Contexto
O Pandorha Engine requer a consolidação de **Sistemas de Eventos Globais, Clocks e Estados de Campanha Estendidos (Fase 13)**. É preciso unificar a forma como o jogo reage a eventos e avanços temporais, registrando o histórico de eventos de campanha (`campaign_events_history`) e avaliando regras reativas como:
- Avanços de relógios de ameaça gerando cercos militares ou alterações climáticas.
- A infâmia de facções atingindo níveis críticos e atraindo invasões automáticas.
- O status `DEBT_MARKED` (Marcado pela Dívida, onde `dívida > fama * 3`) punindo o acampamento de andarilhos.

Na Fase 3, a tabela `campaign_events_history` foi inserida sob `siegeSchema.ts`. No entanto, para que o sistema de eventos seja genérico e acessível por outros slices (como `clocks` ou `world-state`), mantê-la em `siege` causa acoplamento e imports indesejados.

Além disso, o mestre do jogo ou a sessão de campanha deve poder habilitar ou desabilitar regras dinâmicas individuais de campanha de forma ativável/desativável (toggleable).

## Decisão
1. **Novo Slice `src/entities/campaign`**: Criar um slice unificado na camada de entidades para desacoplar a governança e o histórico de eventos de campanha.
2. **Migração do Event History**: Migrar a tabela `campaign_events_history` e seus schemas de validação Zod de `siegeSchema.ts` para o novo `campaignSchema.ts`.
3. **Mecanismo de Trigger no SQLite**: A verificação de regras e triggers de eventos de campanha será realizada no banco SQLite no Web Worker de forma atômica sob transações do Drizzle.
4. **Regras de Campanha Ativáveis (Toggleable Rules)**: Implementar chaves de regras no `WorldState` sob o namespace `system:rules:*`. O `CampaignEventService` verificará o estado dessas chaves antes de aplicar consequências reativas:
   - `system:rules:siege_on_extreme_infamy`: Habilita/desabilita o acionamento de cercos por infâmia <= -10.
   - `system:rules:block_rest_on_debt_marked`: Força 100% de emboscadas em descansos caso o grupo esteja marcado pela dívida.
   - `system:rules:auto_weather_ticking`: Controla se relógios climáticos progridem nos ticks de exploração.
5. **Timeline Visual**: Criar a interface visual `CampaignTimelinePanel.svelte` conectada via RPC para exibir o histórico cronológico de eventos e chaves switches para o estado das regras ativas.

## Consequências
### Positivas
- Desacoplamento limpo de domínios. Clocks, Cerco e Facções agora reportam eventos para a entidade neutra `campaign`, mantendo os limites do FSD intactos.
- Integridade transacional atômica no SQLite (tudo roda sob uma única transação Drizzle no Worker).
- Customização rica da experiência de jogo com as regras toggleable configuradas na UI.

### Negativas
- Exige refatorar os caminhos e referências à antiga tabela `campaign_events_history` no `SqliteOpfsBootstrapService` e nos testes de cerco.

## Relação com Outras Decisões
- Depende de ADR-002 (fsd-4-camadas).
- Depende de ADR-005 (result-pattern).
- Depende de ADR-016 (siege-event-resolution-loop).
- Depende de ADR-017 (wanderer-downtime-engine).
