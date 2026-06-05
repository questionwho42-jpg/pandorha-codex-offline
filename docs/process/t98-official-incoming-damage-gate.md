# T98 Official Incoming Damage Gate

Status: decision gate, no gameplay code.

Task id: `20260605-173410-t98-official-incoming-damage-gate`.

## Objetivo

Definir o proximo passo seguro para sair do dano recebido de treino e chegar a dano real em personagem, sem violar as regras soberanas de combate, HP, persistencia e estados terminais.

Este documento nao promove regra nova para `docs/system/` e nao autoriza save v6, HP real, Moribundo, Inconsciente, durabilidade ou monstros oficiais por inferencia do codigo atual.

## Fontes Lidas

- `docs/system/combat/18-tratado-de-dano.md`: dano usa dados, Matriz, critico, RD e afinidades.
- `docs/system/combat/03-codex-de-combate-e-condicoes.md`: combate define CA, critico por margem, dano total e concentracao ao sofrer dano.
- `docs/architecture/feature_state_machines.md`: HP <= 0 entra em `DYING`; HP/EE nao podem ser modificados sem evento no ledger.
- `docs/architecture/gdd.md`: confirma pipeline de dano, DoT no inicio do turno, PV e durabilidade como sistemas separados.
- `docs/user/combat-training.md`: registra o limite atual de HP de treino local sem persistencia.

## Fatos Atuais

- A vertical slice atual calcula dano recebido apenas como treino.
- O `HP de treino` e local, nao persistido e terminal em 0 ate `Reiniciar encontro`.
- A FSM exige que qualquer mudanca real de HP passe por evento no ledger.
- Dano real tambem pode disparar concentracao, estados terminais, DoT e futuramente durabilidade.

## Opcoes

### Opcao A - Profunda

Implementar dano real completo agora: evento persistido, HP real, save v6, estado `DYING`, concentracao, DoT e integracao com condicoes.

Prós:
- Aproxima o combate de treino do combate oficial.
- Reduz diferenca entre UI e motor final.

Contras:
- Mistura regra, persistencia, estado terminal e UI em uma unica entrega.
- Alto risco de inventar comportamento onde `docs/system/` ainda exige revisao humana.

Custo: Alto.

### Opcao B - Economica

Criar uma microtarefa seguinte apenas para contrato minimo de dano real: evento de dano recebido, falhas tipadas, testes unitarios e fronteira clara entre treino e HP real. Sem UI, sem save v6 e sem migracao ate o contrato do ledger ser aprovado.

Prós:
- Mantem TDD e Result Pattern.
- Preserva o recorte de treino atual.
- Deixa a arquitetura pronta sem assumir regras nao verificadas.

Contras:
- Nao entrega mudanca visivel de gameplay.
- Exige uma segunda tarefa para ligar persistencia/UI.

Custo: Medio.

Decisao recomendada: Opcao B.

### Opcao C - Estrutural

Nao implementar codigo de dano real ainda. Apenas manter o documento de gate e revalidar a vertical slice de treino.

Prós:
- Risco mecanico minimo.
- Evita qualquer impacto em save ou UI.

Contras:
- Nao destrava a proxima fatia de combate.
- Mantem HP real fora do motor por mais uma rodada.

Custo: Minimo.

## Proxima Microtarefa Recomendada

Abrir T99 como `combat-real-damage-event-contract`.

Escopo maximo:

- Definir um contrato puro para evento de dano recebido real.
- Retornar `Result` para falhas de alvo, dano invalido, ledger ausente e regra terminal bloqueada.
- Escrever testes antes da implementacao.
- Manter HP real, save v6, UI, DoT, concentracao, durabilidade e monstros oficiais fora da entrega.

Critérios de aceite:

- Nenhum valor real de HP e mutado fora de evento no ledger.
- A fronteira entre `HP de treino` e HP real fica explicita.
- 100% de cobertura em service/domain novo.
- `.context` do modulo afetado e atualizado.
- `docs/system/` permanece sem alteracao ate revisao humana de regra.

## Gates

Antes de fechar T98:

```powershell
npm.cmd run docs:audit
npm.cmd run lint
npm.cmd test
npm.cmd run automation:doctor
npm.cmd run qa:next-phase-readiness
```
