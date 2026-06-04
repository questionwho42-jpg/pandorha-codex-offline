# ADR-008: Sistema Híbrido de Missões (História em Diálogos e Contratos no Bastião)

- **ID:** ADR-008
- **Status:** Aceito
- **Data:** 2026-06-04
- **Task Ledger:** N/A (Fase de Planejamento)

## Contexto

O diário de missões (`QuestLogPanel`) do Pandorha Engine gerencia os objetivos ativos e rumores de lore da campanha. Contudo, misturar missões narrativas profundas (que alteram o rumo da campanha e exigem roleplay) com contratos econômicos mundanos (como entregar suprimentos ou limpar ninhos de monstros) no mesmo fluxo de interação pode inflar e sobrecarregar o `DialogueService` (árvore de diálogos em AST) com opções condicionais redundantes ou desinteressantes.

## Decisão

Adotar um modelo híbrido para a persistência e aceitação de missões de jogo:

1. **Missões de Campanha (Story/Campaign Quests):**
   - Focadas na crônica e progresso principal do Andarilho.
   - São aceitas e resolvidas **exclusivamente na aba de Diálogos** ao interagir com NPCs relevantes.
   - Exigem validação condicional complexa (por exemplo, possuir pistas específicas reveladas pelo `InvestigationService`).
2. **Contratos da Guilda (Guild Contracts):**
   - Focadas na economia e no Bastião.
   - São aceitas diretamente através de um **Quadro de Contratos do Bastião**.
   - Podem ser concluídas pelo Andarilho principal ou **despachadas para Esquadrões Mercenários (Peões)** no painel de downtime, retornando ouro e renome à guilda.
3. Ambos os tipos de missões compartilham o mesmo schema Drizzle `quests` para auditoria, mas são identificadas por uma coluna de escopo (`scope: 'campaign' | 'guild'`).

## Consequências

**Positivas:**
- **Otimização de Escopo:** O `DialogueService` fica livre de nós de falas irrelevantes ou repetitivos para quests de entrega de recursos.
- **Utilidade aos Mercenários:** Fornece um caso de uso concreto para o despacho de esquadrões de peões, gerando sinergia entre o gerenciamento tático de base e o diário de missões.
- **UX Separada:** O cockpit exibe claramente ao jogador o que é progresso da crônica e o que são contratos operacionais paralelos.

**Negativas:**
- **Duas Rotas de Resolução:** Requer mapear handles e controllers específicos para o despacho de peões e para as falhas/sucessos de diálogos no banco SQLite via RPC.

## Alternativas Consideradas

| Opção | Prós | Contras |
|:---|:---|:---|
| **Sistema Híbrido (Escolhida)** | Mantém diálogos ricos para a história, descentraliza contratos e peões. | Exige tratar resoluções de missões por rotas diferentes no banco. |
| **Integração Total em Diálogos** | Roleplay 100% integrado a NPCs. | Infla a AST de diálogos com estruturas triviais repetitivas. |
| **Quadro de Missões Único** | Lógica centralizada de quests mais fácil de programar. | Silas e Eldrin viram meros estáticos de pouca utilidade na campanha. |
