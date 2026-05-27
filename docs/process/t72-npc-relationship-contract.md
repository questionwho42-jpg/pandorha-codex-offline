# Contrato T72 - Relação Individual Por NPC

## Decisão

A relação individual por NPC não deve ser implementada como atalho em `WorldState`. Antes de qualquer mutação real, a T72 precisa definir contrato de persistência, validação Drizzle-Zod e compatibilidade com save/load.

## Status Da Opção B

T72 deve avançar como núcleo modular, sem UI nova, migration, save v5, RPC pública ou reaproveitamento de `WorldState`. A entrega inicial pode criar schema Drizzle-Zod, tipos, contrato de repositório, fake em memória e serviço puro com Result Pattern e 100% de cobertura.

O contrato pode modelar efeitos conservadores de pressão social por NPC: atitude, status, dano de pressão, idempotência por chave de pressão e marcação de inimigo durável em quebra mental. Qualquer bônus mecânico, penalidade ampla, histórico relacional ou wiring com save/load fica fora desta etapa.

## Regras Do Gate

- Não reutilizar `Fama`/`Infâmia` de facção como relação individual.
- Não salvar relação individual em flags soltas de `WorldState`.
- Não criar UI de dano relacional por NPC antes do contrato de dados.
- Se o contrato exigir novo snapshot, pausar e apresentar relatório A/B/C antes de criar save v5.
- Não registrar `npc_relationships` em migration ou `drizzle.config.mjs` até existir plano de persistência/save aprovado.
- Qualquer serviço novo deve usar Result Pattern, fakes em memória e 100% de cobertura.

## Opções Futuras

- Entidade dedicada `npc_relationships`: melhor para histórico e save/load, mas exige schema e migration.
- Campo derivado em eventos sociais: útil para leitura de histórico, mas não substitui estado atual consultável.
- Apenas flags narrativas: aceitável para cenas únicas, mas proibido para relação individual durável.
