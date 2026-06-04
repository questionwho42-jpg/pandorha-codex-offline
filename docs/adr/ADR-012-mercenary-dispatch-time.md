# ADR-012: Progressão Temporal de Despacho de Mercenários Baseada em Ticks de Hexcrawl

- **ID:** ADR-012
- **Status:** Aceito
- **Data:** 2026-06-04
- **Task Ledger:** N/A (Fase de Planejamento)

## Contexto

O Bastião permite aos Andarilhos aceitar Contratos da Guilda econômicos ou de segurança e despachar Companhias de Mercenários (esquadrões de peões) para resolvê-los em segundo plano. Em jogos de gerenciamento tradicionais ou de mecânica idle, o progresso dessas missões de despacho é regulado em tempo real (ex: minutos ou horas reais) através do relógio do sistema do dispositivo do jogador. Contudo, no Pandorha Engine, o tempo é uma mecânica estrita de RPG dividida em Turnos de Exploração e Dias de Aventura (definidos em `ADR-007`). Usar tempo real geraria uma inconsistência narrativa e matemática severa, além de expor a aplicação local-first a manipulações fáceis (alteração do relógio do sistema operacional).

## Decisão

Adotar a **Alternativa A (Despacho Baseado em Ciclos de Dias de Aventura)**:

1. **Relógios de Expedição Vinculados a Ticks:** O despacho de mercenários cria instâncias de `clocks` vinculadas ao hexcrawl no banco SQLite.
2. **Atualização Temporal Coesa:** O avanço desses relógios de expedição ocorre reativamente e exclusivamente quando o Andarilho principal realiza marchas no mapa axial (`HexcrawlMovementService` gerando ticks de exploração) ou faz descansos de acampamento (`CampRest`).
3. **Resolução de Contratos:** Ao zerar os turnos do relógio de expedição de forma reativa, o Web Worker RPC executa a resolução probabilística do contrato no banco SQLite, atualizando os recursos da guilda de forma atômica e notificando o jogador na interface visual do Bastião.

## Consequências

**Positivas:**
- **Consistência Temporal e Narrativa:** O mundo se move no mesmo ritmo. O tempo que os mercenários levam para marchar reflete o tempo que o Andarilho gasta marchando pelo mapa selvagem.
- **Segurança e Anti-Cheat:** Impede o farm passivo de recursos simplesmente mantendo a janela aberta sem jogar e inviabiliza burlas através da alteração manual da hora do computador.
- **Resiliência Local-First:** O estado das expedições está salvo nas tabelas de relógios do SQLite, sendo restaurado e sincronizado de forma consistente no bootstrap do jogo offline.

**Negativas:**
- **Acoplamento de Serviços:** Exige que a lógica de movimentação no hexcrawl e acampamento dispare ganchos (hooks) de atualização de relógios globais do banco de dados que incluam os relógios de mercenários ativos.

## Alternativas Consideradas

| Opção | Prós | Contras |
|:---|:---|:---|
| **ticks de Hexcrawl (Escolhida)** | Consistência de tempo total no RPG, seguro contra cheat de relógio, integrado ao jogo. | Acoplamento entre movimentação no mapa e expedições de base. |
| **Tempo Real (Idle)** | Sensação de progresso passivo constante mesmo com a aplicação fechada. | Quebra a consistência do RPG, burla fácil de cheat de relógio, difícil rastreamento offline. |
| **Resolução Exclusiva no Downtime** | Isolamento total de lógica no BastionPanel sem dependência de mapa. | Reduz utilidade tática dos mercenários no background durante marchas longas do Andarilho. |
