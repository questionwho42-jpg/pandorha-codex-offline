# Original User Request

## Initial Request — 2026-06-08T09:24:22-03:00

Atualizar a documentação viva do Pandorha Engine (CONTEXT.md, feature-coverage-map.md, changelog.md, llms.txt e possível novo ADR) para refletir com precisão o estado atual do código após as implementações das Fases 51 a 67+ ocorridas entre 2026-06-01 e 2026-06-04.

Working directory: c:\Users\Pichau\Desktop\antigravity\pandorha sistema 28-04
Integrity mode: development

---

## Gap Analysis (pré-requisito de leitura obrigatória)

O agente deve ler os seguintes arquivos ANTES de qualquer edição:
- `docs/architecture/feature-coverage-map.md` — última atualização: 2026-05-31
- `docs/changelog.md` — última entrada: 2026-05-31
- `CONTEXT.md` — glossário de domínio
- `llms.txt` — AI root map
- `docs/process/task-ledger.md` — fonte de verdade das fases concluídas
- `src/entities/` e `src/features/` — para detectar entidades/features sem cobertura no mapa

---

## Requirements

### R1. Atualizar feature-coverage-map.md

Atualizar o mapa de cobertura em `docs/architecture/feature-coverage-map.md` para incluir todas as entidades e features implementadas após 2026-05-31. As adições confirmadas pelo task-ledger incluem:
- **`entities/siege`** — `SiegeService` implementado (Fase 51); não aparece no mapa atual
- **`entities/lore`** — `LoreService` implementado (Fase 57); não aparece no mapa atual
- **`features/chat`** — ChatLog com GM Mode e isGmOnly (Fase 56); aparece como diretório mas sem linha no mapa
- **`features/sandbox`** — Sandbox do GM com mutação de estado e spawn de monstros via RPC (Fase 57/59); não aparece no mapa
- **`features/research`** — status mudou (estava "em progresso") — verificar estado real no código
- **`features/social`** — NegotiationPanel e CountermagicService integrados; verificar se UI avançou
- Atualizar o campo "Atualizado em" para 2026-06-08
- Atualizar os totais de entities e features na seção de sumário
- Adicionar entrada no "Histórico de Atualizações"

### R2. Atualizar CONTEXT.md com novos termos de domínio

Adicionar ao glossário os termos canônicos que surgiram nas implementações recentes, seguindo o formato já estabelecido (termo pt-BR, code em inglês, _Avoid_, _Localização_ quando aplicável):
- **Cerco (Siege):** Sistema de eventos globais e cercos ao Bastião (SiegeService em `src/entities/siege/`). Documentar na seção de Bastião e Camp com nota `_Usa_: Relógio de Progresso`
- **Modo Mestre (GM Mode):** Chave global do Cockpit que revela informações exclusivas do GM, filtra logs no ChatLog e habilita a Sandbox GM
- **Lore Dinâmica (LoreService):** Sistema de encontros narrativos gerados por schemas `lore_encounters` e `campaign_rumors` integrado ao HexcrawlMovementService. Documentar na seção de Exploração/Hexcrawl
- **Cache RPC (RPC Cache):** Cache global na thread principal que reduz latência do Worker para abaixo de 16ms — localização: `src/shared/rpc/model/rpcCache.ts`
- **Sandbox do GM (GM Sandbox):** Interface do GM para mutação de estado do mundo em tempo de jogo (spawn de monstros, alteração de relógios) via RPC direto

### R3. Adicionar entrada no changelog.md

Adicionar entrada consolidada no `docs/changelog.md` cobrindo as Fases 51–67+ (2026-06-01 a 2026-06-04), no formato estabelecido pelo changelog existente (seção dentro dos marcadores `<!-- pandorha-changelog:main -->`), com:
- Data/hora ISO
- branch e commit
- summary das fases cobertas
- entidades e features criadas/modificadas
- seção "Promotion Review" com Done / Next / Risks / Improvements

### R4. Atualizar llms.txt

Atualizar referências desatualizadas em `llms.txt`:
- Na seção de QUICK COMMANDS, verificar se o número de arquivos cobertos pelo teste ainda é correto ou atualizá-lo
- Na seção TIER 3 (feature-coverage-map.md), atualizar o comentário de entities/features para o total correto após as novas adições
- Atualizar o campo `updated` no YAML front-matter para `2026-06-08`

### R5. Avaliar necessidade de novo ADR

Verificar se alguma das decisões arquiteturais tomadas entre 2026-06-01 e 2026-06-04 se qualifica para um ADR segundo os 3 critérios do projeto (difícil de reverter, surpreendente sem contexto, resultado de trade-off real). Candidatos:
- RPC Cache global na thread principal (Fase 54) — latência vs. consistência de dados
- GM Sandbox com mutação de estado por RPC direto (Fase 57/59)

Se qualificar, criar o ADR no formato canônico existente em `docs/adr/ADR-014-*.md` e referenciá-lo em `llms.txt` na seção TIER 1B.

---

## Acceptance Criteria

### Cobertura do feature-coverage-map.md
- [ ] `entities/siege` aparece na tabela com status correto de SiegeService, InMemory, testes e schema DB
- [ ] `entities/lore` aparece na tabela com status correto de LoreService
- [ ] `features/chat` aparece na tabela com status de ChatLog + GM Mode
- [ ] `features/sandbox` aparece na tabela com status da Sandbox GM
- [ ] Campo "Atualizado em" mostra 2026-06-08
- [ ] Totais de entities e features estão corretos e somam corretamente
- [ ] Histórico de Atualizações tem nova entrada

### Cobertura do CONTEXT.md
- [ ] Seção "Domínio de Bastião e Camp" contém o termo "Cerco (Siege)"
- [ ] Novo termo "Modo Mestre" está definido em seção adequada
- [ ] Novo termo "Lore Dinâmica" está definido na seção de Exploração/Hexcrawl
- [ ] Novo termo "Cache RPC" está definido com localização técnica correta
- [ ] Nenhum termo existente foi removido ou alterado sem justificativa

### Cobertura do changelog.md
- [ ] Nova entrada existe com data >= 2026-06-01
- [ ] Entrada lista Fases 51, 52, 53, 54, 55, 56, 57, 59, 65, 67
- [ ] Entrada está dentro dos marcadores `<!-- pandorha-changelog:main -->` / `<!-- /pandorha-changelog:main -->`
- [ ] Seção "Promotion Review" preenchida com Done / Next / Risks

### Cobertura do llms.txt
- [ ] Campo `updated` no YAML front-matter = "2026-06-08"
- [ ] Referência ao feature-coverage-map menciona totais corretos

### ADR (condicional)
- [ ] Se criado, ADR-014 segue o formato canônico e está referenciado em llms.txt na seção TIER 1B
- [ ] Se não criado, agente justifica por que nenhuma decisão se qualifica pelos 3 critérios

---

## Restrições operacionais críticas

- **Windows 11, sem WSL/bash.** Usar PowerShell, `node`, ou `npm.cmd` para qualquer comando.
- **Validação de lint obrigatória** após editar TypeScript: `npm run lint` (Biome)
- **NÃO rodar testes** nesta tarefa — é pure doc update; testes são caros e o escopo não altera lógica
- **Preservar marcadores de automação** nos arquivos (ex: `<!-- pandorha-changelog:main -->`)
- **Não editar** `docs/process/task-ledger.md` diretamente — é território da automação
- **Idioma:** Conteúdo visível ao usuário em pt-BR. Identificadores técnicos, localização de arquivos e exemplos de código em inglês.
- **Formato canônico de termos no CONTEXT.md:**
```
**Nome pt-BR (English Code):**
Descrição em pt-BR de uma linha.
_Localização_: `caminho/para/arquivo.ts` (quando aplicável)
_Avoid_: termos que NÃO devem ser usados
```
