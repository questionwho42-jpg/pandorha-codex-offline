# Gate T79 - Historico De Relacao Por NPC E Save V6

## Decisao

Nao criar save v6 agora. O estado atual de relacao por NPC em `npcRelationships` cobre a necessidade duravel da T76: mostrar estado atual, idempotencia por `social-pressure-${encounterId}` e roundtrip save/load.

Historico append-only so deve existir quando houver mais de uma causa oficial de mudanca de relacao, ou quando a UI precisar auditar a sequencia de eventos sociais alem do estado atual.

## Opcoes Avaliadas

- Opcao A - Criar `npc_relationship_events` e save v6 agora: prepara auditoria completa, mas adiciona migration, contrato de snapshot, repositorio e roundtrip antes de haver regra oficial ou segunda causa de evento.
- Opcao B - Manter save v5 e exibir apenas estado atual: preserva simplicidade, mas nao resolve auditoria futura se relacoes passarem a ter reparo, alianca, inimizade ou presentes.
- Opcao C - Adiar historico ate existir mais de uma causa oficial: evita schema prematuro e mantem o save v5 estavel enquanto `social-pressure` ainda e o unico gatilho real.

## Escolha

Seguir a Opcao C. A proxima fase pode melhorar leitura visual e agrupamento de `Relacoes por NPC` sem mexer no contrato de persistencia.

Se uma fase futura aprovar historico, ela deve abrir um novo gate de save v6 e definir:

- tabela dedicada append-only, sem sobrecarregar `appliedPressureKeysJson`;
- migration Drizzle-Zod propria;
- migracao v1-v5 para v6 sem perda de `npcRelationships`;
- contrato de save/load com roundtrip e cobertura 100%;
- UI ou relatorio que justifique por que o historico e visivel ou auditavel.

## Guardrails

- Nao alterar `CURRENT_SAVE_VERSION` nesta fase.
- Nao criar `npc_relationship_events` sem regra oficial ou necessidade de auditoria validada.
- Nao usar `WorldState` como historico de relacao individual.
- Nao adicionar bonus, penalidades, presentes, desculpas, aliancas ou inimizade mecanica sem regra em `docs/system/`.
- Manter `npcRelationships` como fonte duravel do estado atual ate novo gate aprovado.
