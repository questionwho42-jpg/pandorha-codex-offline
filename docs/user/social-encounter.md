# Negociação Social

Este guia explica como testar a negociação social visível do Pandorha Engine.

## O Que Já Funciona

- A aba `Relações` mostra NPCs de treino para negociação.
- Você pode iniciar uma negociação com a `Corretora de Treino`, o `Informante de Treino` ou o `Capitão de Treino`.
- O negociador vem dos personagens criados ou carregados na sessão.
- A área `Fala do NPC` mostra uma árvore curta de diálogo para o NPC de treino selecionado.
- Você pode escolher uma fala como `Persuadir`, `Barganhar` ou `Pressionar`.
- Algumas falas de `Pressionar` aparecem bloqueadas quando o personagem não tem HP mental suficiente.
- No `Informante de Treino`, `Pressionar` exige HP mental 7; com HP mental 6/6, a opção fica visível, mas desabilitada.
- No `Capitão de Treino`, a árvore mostra dever, moral da tropa e custo da escolta; `Pressionar` mostra `Exige HP mental 8 ou maior para pressionar o capitão sem quebrar a moral da tropa.` quando bloqueado.
- No `Capitão de Treino`, `Barganhar` exige `Fama 1` com a facção dele; no estado inicial de treino, essa opção fica disponível.
- Ao escolher `Barganhar`, a resposta do NPC muda para uma fala de troca proposta.
- `Barganhar` seleciona o campo `Argumento` correspondente, mostra `Modificador do argumento: +1` e adiciona esse bônus ao apelo social.
- A tela mostra rolagem, DC, HP mental, paciência, persuasão, atitude, status e log.
- O log registra `Opção de diálogo escolhida: Barganhar`.
- Quando a negociação termina, a consequência é registrada em `WorldState` com a última escolha de diálogo usada.
- Consequências de `Persuadir`, `Barganhar` e `Pressionar` têm resumos diferentes para deixar claro qual abordagem encerrou a cena.
- Quando uma negociação terminal usa `Pressionar`, a facção associada ao NPC perde 1 nível de `Fama` uma única vez por encontro.
- Quando `Pressionar` é usado com a `Fama` da facção já em 0, a facção ganha 1 nível de `Infâmia` e um clock de `Retaliação` aparece em `Relações`.
- O save local v4 preserva estado da negociação, opção de diálogo escolhida, eventos, log e consequência.

## Como Testar No Navegador

1. Abra `http://127.0.0.1:5173/`.
2. Crie um personagem válido em `Personagens`, ou clique em `Carregar save` se já houver um personagem salvo.
3. Clique em `Relações`.
4. Em `Negociação social`, selecione `Corretora de Treino`.
5. Clique em `Iniciar negociação`.
6. Confirme que aparecem `HP mental 8/8`, `Paciência 6/6`, `Persuasão 0/3` e `Fala do NPC`.
7. Confirme que a fala inicial diz que a corretora pede uma proposta concreta.
8. Clique na opção de diálogo `Barganhar`.
9. Confirme que a resposta do NPC diz que ela ouviu a `troca proposta`.
10. Confirme que o argumento selecionado virou `Barganhar` e que aparece `Modificador do argumento: +1`.
11. Clique em `Fazer apelo`.
12. Confirme que a rolagem mostra `Bônus 1` e que o log cita `Barganhar`.
13. Repita `Fazer apelo` até convencer o NPC e confirme que a consequência em `WorldState` cita a troca proposta de `Barganhar`.
14. Para validar bloqueio de opção, selecione `Informante de Treino` e clique em `Reiniciar negociação`.
15. Confirme que aparecem `HP mental 6/6`, `Fala do NPC` e a fala inicial sobre exigir uma garantia antes de falar.
16. Confirme que a opção `Pressionar` aparece desabilitada com o texto `Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.`.
17. Clique na opção de diálogo `Barganhar`.
18. Confirme que a resposta do NPC diz que a troca pode protegê-lo depois da conversa.
19. Confirme que o argumento selecionado virou `Barganhar` e que aparece `Modificador do argumento: +1`.
20. Clique em `Fazer apelo`.
21. Confirme que a rolagem mostra `Bônus 1` e que o log cita `Opção de diálogo escolhida: Barganhar`.
22. Para validar a árvore do capitão, selecione `Capitão de Treino` e clique em `Reiniciar negociação`.
23. Confirme que a fala inicial cita `moral da tropa`.
24. Confirme que aparecem as opções `Persuadir`, `Barganhar` e `Pressionar`.
25. Confirme que `Barganhar` está disponível porque a facção do capitão começa com `Fama 1` e clique nessa opção.
26. Confirme que a resposta do NPC cita `custo da escolta`.
27. Confirme que `Pressionar` exige `HP mental 8` quando a negociação estiver abaixo desse limite.
28. Para validar a consequência de pressão, volte para `Corretora de Treino`, reinicie a negociação, escolha `Pressionar` e faça apelos até encerrar a conversa.
29. Confirme que a consequência em `WorldState` cita `Pressionar` e `perda de 1 nível de Fama`.
30. Confirme que a `Liga Mercante de Treino` mostra a `Fama` reduzida.
31. Repita a pressão quando a `Fama` estiver em 0 e confirme que a consequência cita `Infâmia`.
32. Confirme que `Relações` mostra `Retaliação: Liga Mercante de Treino - 0/4 fatias`.
33. Clique em `Salvar sessão`.
34. Recarregue a página.
35. Clique em `Carregar save`.
36. Volte para `Relações` e confirme que a resposta da árvore, negociação, log, consequência com a escolha de diálogo, `Fama`, `Infâmia` e clock de retaliação voltaram.

## Limitações Atuais

- As árvores atuais são curtas e existem para a `Corretora de Treino`, o `Informante de Treino` e o `Capitão de Treino`.
- `Pressionar` ainda não altera relação individual do NPC nem avança clocks de retaliação automaticamente.
- O bloqueio por HP mental só impede a opção de diálogo; ele não consome HP mental por conta própria.
- A negociação usa NPCs de treino, não NPCs finais de lore.
- O save continua usando apenas o slot `primary`.
