# Guia De Usuario: Combate De Treino

Este guia mostra como testar a vertical slice de combate no navegador. O objetivo e validar um combate de treino simples, deterministico, usando o loadout persistido do personagem no `Inventario`.

## O Que Ja Funciona

- Voce pode abrir o app em `http://localhost:5173/` ou `http://127.0.0.1:5173/`.
- A aba `Combate` permite escolher um atacante e um alvo de treino.
- `Aria` sempre aparece como atacante de treino.
- Personagens criados na sessao atual aparecem como atacantes adicionais.
- Personagens da sessao usam o bloco `Loadout do Inventario`, derivado da arma, escudo e armadura equipados na aba `Inventario`.
- Sem arma equipada, `Atacar` fica indisponivel e a tela oferece `Abrir Inventario`.
- Se arma, escudo ou armadura equipada estiver como item quebrado, o combate bloqueia o uso desse loadout e orienta ajuste no `Inventário`.
- Quando o personagem equipa `Espada Longa`, `Armadura de Couro` e `Escudo Redondo` no inventario, o combate mostra `Arma ativa: Espada Longa (1d8)` e `Defesa equipada` com `CA equipada +3`.
- Quando o personagem carrega `Cinto de Poções` no inventario, o combate mostra `Cinto de poções: 5/5` ao atingir a pilha cheia.
- `Usar poção do cinto` consome 1 unidade do inventario e registra `Poção do cinto usada em treino. HP real não foi alterado.`.
- Personagens da sessao tambem mostram `HP de treino`, um medidor local que usa o HP maximo derivado da ficha.
- `Aria usa perfil fixo de treino` e nao depende do inventario.
- A tela mostra `Rodada`, `Turno de ...` e `Acoes 3/3`.
- `Atacar` gasta 1 acao e registra resultado, rolagem de dado da arma equipada quando houver, dano, HP restante e log.
- Alvos de treino podem aplicar RD e afinidades defensivas ja suportadas pelo pipeline de dano.
- Quando Aria e a atacante, o turno do alvo de treino continua passivo e registra que ele manteve posicao.
- Quando um personagem da sessao e o atacante, encerrar o turno do alvo resolve um ataque de treino contra a CA equipada do personagem, calcula dano de treino e reduz apenas o `HP de treino`.
- O HP real permanece intacto: o medidor local pode chegar a 0, mas Moribundo e Inconsciente nao sao aplicados nesta fatia.
- Quando o `HP de treino` chega a 0, a tela mostra `Teste recebido encerrado`; para testar outro dano recebido, use `Reiniciar encontro`.
- Quando o alvo chega a 0 HP, a tela mostra `Alvo derrotado`, bloqueia novos ataques e mantem `Reiniciar encontro` disponivel.

## Loadout Persistido

O gate `docs/process/combat-persistent-loadout-gate.md` foi implementado nesta
superficie: personagens da sessao nao usam mais seletores locais de equipamento
no combate. Para mudar arma, escudo ou armadura, altere o loadout na aba
`Inventario` e volte para `Combate`.

## Teste Rapido Com Aria

1. Abra `http://localhost:5173/`.
2. Clique em `Combate`.
3. Confirme que o atacante selecionado e `Aria`.
4. Confirme que aparecem `Rodada 1`, `Turno de Aria` e `Acoes 3/3`.
5. Clique em `Atacar`.
6. Confirme que o log mostra o ataque de Aria, o sucesso contra a CA e o dano aplicado.
7. Confirme que `Acoes` mudou para `2/3`.
8. Clique em `Encerrar turno`.
9. Confirme que o turno mudou para `Guarda de Treino` e que `Atacar` ficou desabilitado.
10. Clique em `Encerrar turno` de novo.
11. Confirme que o log informa que o alvo manteve posicao e que a rodada avancou.

## Teste Com Personagem Da Sessao

Crie um personagem antes de entrar no combate:

| Campo | Valor |
| :--- | :--- |
| Nome | Nara |
| Conceito | Duelista de teste |
| Ancestralidade | Humano |
| Tracos | Escolha exatamente 3 tracos humanos |
| Classe | Vanguarda |
| Antecedente | Abrigo da Fe |
| Nivel | 1 |
| Fisico | 3 |
| Mental | 2 |
| Social | 1 |
| Conflito | 2 |
| Interacao | 2 |
| Resistencia | 2 |

Depois:

1. Clique em `Inventario`, selecione `Nara` e carregue `Espada Longa`, `Escudo Redondo`, `Armadura de Couro` e `Cinto de Poções` 5 vezes.
2. Use `Equipar arma`, `Equipar escudo` e `Vestir armadura`.
3. Use `Marcar quebrado` na arma equipada, clique em `Combate` e confirme que o item quebrado bloqueia o loadout e orienta voltar ao `Inventário`; depois volte ao inventario e use `Reparar`.
4. Clique em `Combate`.
5. No seletor `Atacante`, escolha `Nara`.
5. Confirme que a ficha resumida mostra HP maximo, Iniciativa e Carga.
6. Confirme que `Loadout do Inventario` mostra `Arma equipada: Espada Longa`, `Escudo equipado: Escudo Redondo` e `Armadura equipada: Armadura de Couro`.
7. Confirme que o helper mostra `Arma ativa: Espada Longa (1d8)`.
8. Confirme que `Defesa equipada` mostra `CA equipada +3 (Armadura de Couro +2, Escudo Redondo +1)`.
9. Confirme que `Cinto de poções: 5/5` aparece no bloco `Loadout do Inventario`.
10. Clique em `Usar poção do cinto`.
11. Confirme que o resumo muda para `Cinto de poções: 4/5` e que o log mostra `Poção do cinto usada em treino. HP real não foi alterado.`.
12. Confirme que o uso de treino não altera HP real, HP de treino ou estados oficiais.
13. Confirme que o `Perfil de dano` mostra `Matriz Fisica: 3`.
14. Confirme que o resumo de dano mostra `Espada Longa: 1d8 (rolado no ataque) + Fisico 3`.
15. Clique em `Atacar`.
16. Confirme que o log usa o nome `Nara`.
17. Confirme que o log registra a rolagem auditavel da arma.
18. Confirme que o dano final usa a arma equipada e a Matriz do personagem.
19. Troque o alvo para `Duelista de Treino` e clique em `Atacar` em um encontro reiniciado.
20. Confirme que o dano final e reduzido pela defesa do alvo: a rolagem deterministica gera dano base 7, RD 1 reduz para 6 e resistencia fisica reduz para 3.
21. Clique em `Encerrar turno` para passar ao alvo.
22. Confirme que a instrucao do turno avisa que o alvo resolvera o ataque contra a CA equipada de `Nara`.
23. Clique em `Encerrar turno` de novo.
24. Confirme que o log registra o ataque do alvo contra a CA do personagem, calcula dano de treino e atualiza `HP de treino`.
25. Confirme que a ficha real continua intacta; se o `HP de treino` chegar a 0, a tela informa que Moribundo e Inconsciente nao foram aplicados.
26. Quando aparecer `Teste recebido encerrado`, confirme que o proximo dano recebido de treino exige `Reiniciar encontro`.

## Escolhendo Alvos

A aba `Combate` tem tres alvos de treino:

| Alvo | CA | HP | Defesa | Uso |
| :--- | :-: | :-: | :--- | :--- |
| Guarda de Treino | 15 | 18 | Sem RD ou afinidade. | Alvo equilibrado para validar ataque e derrota rapida. |
| Baluarte de Treino | 20 | 24 | RD 2 e imunidade fisica de treino. | Alvo resistente para validar falha contra CA alta. |
| Duelista de Treino | 17 | 14 | RD 1 e resistencia fisica. | Alvo agil para validar defesa leve, troca de alvo e reset. |

Ao trocar o alvo, o HP, o ultimo resultado, o log e o turno reiniciam.

## Como Derrotar O Alvo

1. Selecione `Guarda de Treino`.
2. Use `Aria` ou um personagem da sessao.
3. Clique em `Atacar` ate o HP chegar a `0`.
4. Confirme que aparece `Alvo derrotado`.
5. Confirme que `Atacar` e `Encerrar turno` ficam desabilitados.
6. Clique em `Reiniciar encontro` para testar de novo.

## Como Ler A Tela

- `Rodada`: mostra o ciclo atual do encontro.
- `Turno`: mostra quem pode agir agora.
- `Acoes`: mostra quantas acoes restam no turno atual.
- `Ficha no combate`: mostra dados resumidos do atacante selecionado.
- `Loadout do Inventario`: mostra a arma, o escudo e a armadura persistidos no inventario do personagem.
- `Cinto de poções`: mostra a pilha persistida de `Cinto de Poções` e permite consumir 1 unidade em treino.
- `Abrir Inventario`: aparece quando o personagem da sessao nao possui arma equipada para atacar.
- `Defesa equipada`: mostra o bonus de CA derivado da armadura e do escudo persistidos, a `CA contra treino` usada no ataque recebido e o `HP de treino` local do personagem da sessao.
- `Previa local de HP real`: aparece separada do `HP de treino` para mostrar o replay local dos eventos de dano real; ela nao salva a ficha e nao aplica Moribundo ou Inconsciente.
- `Teste recebido encerrado`: aparece quando o `HP de treino` chegou a 0 e bloqueia novo dano recebido de treino ate `Reiniciar encontro`.
- `Perfil de dano`: mostra qual Matriz esta sendo usada no dano de treino.
- `Ultimo resultado`: resume o ultimo ataque resolvido.
- `Log do encontro`: lista os eventos em ordem.

## Limites Desta Versao

- O encontro de combate existe apenas na sessao atual do navegador.
- Recarregar a pagina reinicia o encontro, o turno, o log e o `HP de treino`; personagens, inventario e loadout voltam apenas depois de `Carregar save`.
- O HP real do personagem ainda nao e alterado por combate; apenas o `HP de treino` local muda durante o encontro.
- A `Previa local de HP real` tambem e local ao encontro: ela vem de eventos em memoria, nao grava save, nao muda a ficha e nao aplica estados oficiais.
- O cinto de poções consome apenas a pilha persistida no inventario; ele nao cura, nao altera HP real, nao altera HP de treino e nao aplica estados oficiais.
- A arma equipada vem do loadout persistido do inventario, mas o ataque ainda nao gasta durabilidade, nao consome municao e ainda nao usa proficiencia.
- As defesas dos alvos de treino entram como RD e afinidades fixas; vulnerabilidade com `+1d6` auditavel ainda nao entra.
- Armaduras e escudos do personagem entram como CA alvo para o ataque de treino recebido; item quebrado bloqueia uso no combate, mas nao ha desgaste automatico, penalidade mecanica de item danificado, reparo por Acampamento, dano, durabilidade por rodada ou estados oficiais.
- Talentos, magia e condicoes ainda nao entram no calculo.
- A iniciativa ainda e fixa: atacante primeiro, alvo depois.
- O alvo de treino ataca apenas personagens da sessao no turno dele; ele calcula dano de treino local, nao causa dano persistente e nao possui IA complexa.
- Chegar a 0 no `HP de treino` nao aplica Moribundo, Inconsciente, teste de morte, ferimentos ou qualquer mudanca persistida.
- Depois de 0 no `HP de treino`, o app nao calcula outro dano recebido de treino para o mesmo encontro; reinicie para repetir o teste.
- Reinicie o encontro para testar outro dano recebido.
- Os alvos sao ficticios para teste; ainda nao sao monstros oficiais.
- Nao ha XP, loot, recompensa, consumo de item em combate, IA complexa ou dano persistido.

## Fontes

- `docs/user/character-creation.md`: explica como criar o personagem usado no teste.
- `docs/system/survival/00-mecanicas-fundamentais.md`: define os fundamentos do sistema e acoes.
- `docs/system/combat/03-codex-de-combate-e-condicoes.md`: confirma a formula de CA usada como alvo defensivo.
- `docs/system/survival/05-00-regras-de-classe.md`: fonte para atributos derivados exibidos na ficha resumida.
- `docs/system/combat/18-tratado-de-dano.md`: confirma o uso da Matriz Fisica em ataque corpo a corpo padrao.
- `src/features/combat-encounter/model/combatTrainingEnemyAttack.ts`: calcula a CA contra treino usada no ataque recebido.
- `src/features/combat-encounter/model/combatTrainingDefenderHitPoints.ts`: controla o HP de treino local sem persistir dano real.
- `src/features/combat-encounter/model/combatRealDamageLedgerUpdate.ts`: monta a previa local de HP real por evento e replay, sem persistir a ficha.
- `src/features/combat-encounter/ui/CombatEncounterPanel.svelte`: representa a tela atual validada no navegador.
