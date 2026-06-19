# ADR-017: Arquitetura do Motor de Downtime e Desacoplamento FSD via Adapters Locais

## Status
Accepted — 2026-06-13

## Contexto
O Pandorha Engine requer a implementação da Fase 4: **Downtime dos Andarilhos (Recesso Semanal)**. A mecânica consiste em permitir que cada Andarilho do grupo aloque semanas de recesso em **Tags de Ação (A a H)** na metrópole ou no Bastião (sustento, cura intensiva, investigação arcana, especulação mercantil, redução de infâmia, retreinamento de talentos, gestão de domínio e juramentos de facção).

Pelo padrão Feature-Sliced Design (FSD), a nova entidade `entities/downtime` precisa interagir com múltiplas entidades vizinhas:
- `entities/character` (para ouro, exaustão, talentos, enfermidades)
- `entities/social` (para reputação, fama, infâmia, pactos de patrocínio)
- `entities/equipment` (para recondicionar durabilidade de armas/ferramentas)
- `entities/quest` (para revelar segredos e pistas de campanha)

Importações diretas entre slices vizinhos na camada `entities/` gerariam dependências circulares e acoplamento ilegal violando as regras de `AGENTS.md`.

## Decisão
1. Adotar a mesma arquitetura de isolamento aplicada ao `SiegeService` na `ADR-016`: declarar **Interfaces Adaptadoras Locais** dentro do domínio do downtime (`src/entities/downtime/domain/DowntimeService.ts`).
2. O `DowntimeService` calcula a resolução das 8 Tags (A a H) manipulando puramente estas interfaces abstratas, sem conhecer os repositórios ou esquemas reais de outras fatias.
3. As interfaces adaptadoras locais serão:
   - `IDowntimeActor`: controla moedas, remoção de doenças/status, respec de talentos.
   - `IDowntimeFaction`: lê e atualiza standing (fama/infâmia) e pactos ativos.
   - `IDowntimeEquipment`: recondiciona durabilidade.
   - `IDowntimeQuest`: insere pistas extraídas por investigação.
   - `IDowntimeDice`: abstração para rolagens de DC determinísticas.
4. O bootstrap de persistência (`SqliteOpfsBootstrapService` em `shared/persistence`) implementa as classes concretas correspondentes a estas interfaces (lendo dados reais do SQLite via Drizzle), invoca o `DowntimeService` para processar a semana de recesso e persiste as mutações resultantes em bloco sob uma transação atômica.
5. Expor as operações de recesso via RPC no Web Worker para alimentar o painel visual `DowntimePanel.svelte`.

## Consequências
### Positivas
- Respeito absoluto aos limites de isolamento da arquitetura Feature-Sliced Design (FSD).
- Testabilidade isolada e robusta do `DowntimeService` com 100% de cobertura via TDD utilizando mocks puros das interfaces.
- Integridade transacional atômica garantida no banco local-first (se a resolução de um Andarilho falhar, reverte as transações de todos).

### Negativas
- Necessidade de codificar adapters e classes wrapper na camada de persistência para converter registros de banco nas interfaces locais do Downtime.

## Relação com Outras Decisões
- Depende de ADR-002 (fsd-4-camadas).
- Depende de ADR-005 (result-pattern).
- Depende de ADR-016 (siege-event-resolution-loop).
