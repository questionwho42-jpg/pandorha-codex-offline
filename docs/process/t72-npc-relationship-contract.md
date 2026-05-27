# Contrato T72 - Relação Individual Por NPC

## Decisão

A relação individual por NPC não deve ser implementada como atalho em `WorldState`. Antes de qualquer mutação real, a T72 precisa definir contrato de persistência, validação Drizzle-Zod e compatibilidade com save/load.

## Regras Do Gate

- Não reutilizar `Fama`/`Infâmia` de facção como relação individual.
- Não salvar relação individual em flags soltas de `WorldState`.
- Não criar UI de dano relacional por NPC antes do contrato de dados.
- Se o contrato exigir novo snapshot, pausar e apresentar relatório A/B/C antes de criar save v5.
- Qualquer serviço novo deve usar Result Pattern, fakes em memória e 100% de cobertura.

## Opções Futuras

- Entidade dedicada `npc_relationships`: melhor para histórico e save/load, mas exige schema e migration.
- Campo derivado em eventos sociais: útil para leitura de histórico, mas não substitui estado atual consultável.
- Apenas flags narrativas: aceitável para cenas únicas, mas proibido para relação individual durável.
