# ADR-016: Loop de Resolução de Eventos de Cerco (Siege) e Isolamento de Fatias FSD

## Status
Accepted — 2026-06-11

## Contexto
O Pandorha Engine introduziu eventos globais de ameaça na base de operações (Bastião) geridos pelo `SiegeService`. O evento de cerco é disparado por Progress Clocks de ameaça reativos a patrocínios de facções ou infâmia de acampamento. O loop de resolução do cerco afeta a integridade física do Bastião (`integrityCurrent`) e a integridade de esquadrões de mercenários (`cohesionCurrent`), matando-os caso chegue a 0.

Pela arquitetura Feature-Sliced Design (FSD) do projeto, slices vizinhos da mesma camada (como `entities/siege`, `entities/bastion` e `entities/mercenary`) não podem importar um ao outro diretamente para evitar acoplamento circular e dependências cruzadas ilegais. Entretanto, a lógica de resolução do cerco precisa calcular e atualizar os atributos físicos e integridade de todos esses domínios em um único local.

## Decisão
1. Declarar interfaces adaptadoras locais (`ISiegeBastionDefender` e `ISiegeMercenarySquad`) dentro do domínio de cerco (`src/entities/siege/domain/SiegeService.ts`).
2. O `SiegeService` executa todo o cálculo puramente em termos dessas interfaces adaptadoras (Decorator de bônus físicos de mercenários, mitigação de dano por coesão via algoritmo round-robin, baixas físicas/status `"dead"`, e aplicação do dano estrutural remanescente no Bastião).
3. A persistência e orquestração transacional no SQLite são delegadas à camada superior de bootstrap de persistência (`SqliteOpfsBootstrapService.ts` no `shared/persistence`), que lê os registros de cada tabela, chama o serviço de cerco passando os registros adaptados e escreve as atualizações consolidadas de volta em uma transação atômica.
4. Expor as operações de cerco via bridge RPC de Web Workers (`WorkerSiegeRepository`) para que a interface de usuário reativa (`BastionPanel.svelte`) possa interagir e resolver o cerco de forma assíncrona.

## Consequências
### Positivas
- Preservação estrita das regras arquiteturais de isolamento de slices no Feature-Sliced Design (FSD).
- Lógica de combate/cerco facilmente testável de forma determinística e isolada (`SiegeService.spec.ts`).
- Atualização atômica coordenada de múltiplos domínios (Bastião, Clocks, Mercenários) em transação SQLite local-first.
- Interface do Cockpit reativa em Svelte 5 Rune integrada sem bloqueios ou latência de CPU na thread principal.

### Negativas
- Necessidade de mapeamento explícito de objetos de banco para os adapters locais na camada de persistência.
- Lógica distribuída entre o serviço de domínio (`SiegeService`) e o serviço de persistência (`SqliteOpfsBootstrapService`).

## Alternativas Consideradas
- **Imports Diretos de Repositórios:** Viola as restrições inegociáveis de FSD de `AGENTS.md` e causaria erros severos no linter de arquitetura.
- **Fusão de Slices:** Fundir `bastion`, `mercenary` e `siege` em um único slice gigante. Rejeitado para manter os domínios coesos e de tamanho navegável por IAs e desenvolvedores.

## Relação com Outras Decisões
- Depende de ADR-002 (fsd-4-camadas).
- Depende de ADR-004 (sqlite-wasm-opfs).
- Depende de ADR-005 (result-pattern).
