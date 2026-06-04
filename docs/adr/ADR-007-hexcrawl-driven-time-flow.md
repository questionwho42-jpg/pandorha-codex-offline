# ADR-007: Fluxo de Tempo Centralizado pelo Hexcrawl (Turno de Exploração e Dia de Aventura)

- **ID:** ADR-007
- **Status:** Aceito
- **Data:** 2026-06-04
- **Task Ledger:** N/A (Fase de Planejamento)

## Contexto

O Pandorha Engine possui múltiplos sistemas paralelos que dependem de passagem de tempo no downtime (como progressão de projetos de Bastião, resfriamento de Heat em células de espionagem, recuo de coesão em esquadrões mercenários e recuperação natural de ferimentos). 

Anteriormente, a passagem de tempo em abas de downtime do cockpit dependia de botões artificiais de "Passar Turno Semanal" ou "Recesso" na interface. No entanto, de acordo com as regras canônicas de RPG do Pandorha, o tempo flui organicamente através das ações de locomoção e acampamento do grupo de Andarilhos no mundo físico.

## Decisão

Unificar e centralizar todo o controle temporal do jogo sob o **Hexcrawl (Movimentação no Mapa)** e o **Descanso (Camp Rest)**:

1. Cada deslocamento entre hexágonos adjacentes consome exatamente **1 Turno de Exploração** (6 horas).
2. O acúmulo de **4 Turnos de Exploração** encerra um **Dia de Aventura** completo.
3. No final de cada Dia de Aventura (ou ao realizar um `Camp Rest`), o motor avança o tempo de downtime em 1 dia de forma reativa no banco de dados SQLite.
4. O ciclo de **Recesso Semanal** de manutenção do Bastião e das companhias mercenárias é disparado automaticamente a cada **7 Dias de Aventura** transcorridos.
5. Fica proibido o uso de botões genéricos de "Passar Turno" ou "Avançar Tempo" diretamente nos painéis de gerenciamento de guilda.

## Consequências

**Positivas:**
- **Coesão Narrativa:** A caravana e o Bastião avançam em sintonia com a jornada física do Andarilho.
- **Sobrevivência Estratégica:** Esperar pelo retorno de missões de peões consome recursos reais (rações de acampamento) e impõe riscos de emboscada e exaustão biológica durante a marcha.
- **Redução de UI:** Simplifica o cockpit removendo botões artificiais de passagem de turno.

**Negativas:**
- **Estagnação Geográfica:** Se o Andarilho principal permanecer inativo em um hexágono seguro, as células mercenárias não progridem, exigindo mecânicas locais (como projetos de Bastião locais) que também gastem Turnos de Exploração para evitar o travamento do jogo.

## Alternativas Consideradas

| Opção | Prós | Contras |
|:---|:---|:---|
| **Tempo Centralizado no Mapa (Escolhida)** | Imersão de sobrevivência integrada, coesão lógica. | Exige movimentação do grupo no hexcrawl para progresso das ações. |
| **Passagem Baseada em Descansos** | Fácil de programar, amarra progresso às rações de acampamento. | Suscetível a abusos de spam de repouso por parte do jogador. |
| **Sistemas Independentes (Botões Manuais)** | Desacoplamento total dos módulos, mais simples. | Ruptura de imersão de RPG; mundo com escalas temporais desconexas. |
