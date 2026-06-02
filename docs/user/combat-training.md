# Guia De Usuario: Combate De Treino

Este guia mostra como testar a vertical slice T22 de combate no navegador. O objetivo e validar um combate de treino simples, deterministico e sem persistencia.

## O Que Ja Funciona

- Voce pode abrir o app em `http://localhost:5173/` ou `http://127.0.0.1:5173/`.
- A aba `Combate` permite escolher um atacante e um alvo de treino.
- `Aria` sempre aparece como atacante de treino.
- Personagens criados na sessao atual aparecem como atacantes adicionais.
- Personagens da sessao usam o seletor `Arma equipada`; a arma padrao e `Espada Longa`.
- `Aria usa perfil fixo de treino`, mesmo quando o seletor mostra uma arma da sessao.
- A tela mostra `Rodada`, `Turno de ...` e `Acoes 3/3`.
- `Atacar` gasta 1 acao e registra resultado, rolagem de dado da arma quando houver, dano, HP restante e log.
- O turno do alvo de treino existe, mas ele nao tem IA: ao encerrar o turno dele, o log informa que ele manteve posicao.
- Quando o alvo chega a 0 HP, a tela mostra `Alvo derrotado`, bloqueia novos ataques e mantem `Reiniciar encontro` disponivel.

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

1. Clique em `Combate`.
2. No seletor `Atacante`, escolha `Nara`.
3. Confirme que a ficha resumida mostra HP maximo, Iniciativa e Carga.
4. Confirme que `Arma equipada` mostra `Espada Longa`.
5. Confirme que o helper mostra `Arma ativa: Espada Longa (1d8)`.
6. Confirme que o `Perfil de dano` mostra `Matriz Fisica: 3`.
7. Confirme que o resumo de dano mostra `Espada Longa: 1d8 (rolado no ataque) + Fisico 3`.
8. Troque `Arma equipada` para `Adaga` e confirme que o resumo muda para `Adaga: 1d4 (rolado no ataque) + Fisico 3`.
9. Clique em `Atacar`.
10. Confirme que o log usa o nome `Nara`.
11. Confirme que o log registra a rolagem auditavel da arma, por exemplo `Adaga rolou ... em 1d4`.
12. Confirme que o dano final usa a arma selecionada e a Matriz do personagem.

## Escolhendo Alvos

A aba `Combate` tem tres alvos de treino:

| Alvo | CA | HP | Uso |
| :--- | :-: | :-: | :--- |
| Guarda de Treino | 15 | 18 | Alvo equilibrado para validar ataque e derrota rapida. |
| Baluarte de Treino | 20 | 24 | Alvo resistente para validar falha contra CA alta. |
| Duelista de Treino | 17 | 14 | Alvo agil para validar troca de alvo e reset. |

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
- `Arma equipada`: escolhe uma arma local para personagens criados na sessao.
- `Perfil de dano`: mostra qual Matriz esta sendo usada no dano de treino.
- `Ultimo resultado`: resume o ultimo ataque resolvido.
- `Log do encontro`: lista os eventos em ordem.

## Limites Desta Versao

- O combate existe apenas na sessao atual do navegador.
- Recarregar a pagina reinicia o encontro e remove personagens criados na sessao.
- O HP real do personagem ainda nao e usado.
- A arma selecionada entra apenas como loadout local e dado de dano auditavel; ela nao e salva, nao gasta durabilidade e ainda nao usa proficiencia.
- Armaduras, escudos, talentos, magia e condicoes ainda nao entram no calculo.
- A iniciativa ainda e fixa: atacante primeiro, alvo depois.
- O alvo de treino nao ataca, nao causa dano e nao possui IA.
- Os alvos sao ficticios para teste; ainda nao sao monstros oficiais.
- Nao ha XP, loot, recompensa, banco, Worker, OPFS ou save.

## Fontes

- `docs/user/character-creation.md`: explica como criar o personagem usado no teste.
- `docs/system/survival/00-mecanicas-fundamentais.md`: define os fundamentos do sistema e acoes.
- `docs/system/survival/05-00-regras-de-classe.md`: fonte para atributos derivados exibidos na ficha resumida.
- `docs/system/combat/18-tratado-de-dano.md`: confirma o uso da Matriz Fisica em ataque corpo a corpo padrao.
- `src/features/combat-encounter/ui/CombatEncounterPanel.svelte`: representa a tela atual validada no navegador.
