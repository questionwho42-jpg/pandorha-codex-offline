# Negociação Social

Este guia explica como testar a negociação social visível do Pandorha Engine.

## O Que Já Funciona

- A aba `Relações` mostra NPCs de treino para negociação.
- Você pode iniciar uma negociação com a `Corretora de Treino`.
- O negociador vem dos personagens criados ou carregados na sessão.
- A área `Fala do NPC` mostra uma árvore curta de diálogo para a `Corretora de Treino`.
- Você pode escolher uma fala como `Persuadir`, `Barganhar` ou `Pressionar`.
- Ao escolher `Barganhar`, a resposta do NPC muda para a fala da troca proposta.
- `Barganhar` seleciona o campo `Argumento` correspondente, mostra `Modificador do argumento: +1` e adiciona esse bônus ao apelo social.
- A tela mostra rolagem, DC, HP mental, paciência, persuasão, atitude, status e log.
- O log registra `Opção de diálogo escolhida: Barganhar`.
- Quando a negociação termina, a consequência é registrada em `WorldState`.
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
13. Repita `Fazer apelo` até convencer o NPC, se quiser validar a consequência.
14. Clique em `Salvar sessão`.
15. Recarregue a página.
16. Clique em `Carregar save`.
17. Volte para `Relações` e confirme que a resposta da árvore, negociação, log e consequência voltaram.

## Limitações Atuais

- A árvore atual é curta e existe apenas para a `Corretora de Treino`.
- `Pressionar` usa apenas modificador `-1`; piora de relação fica para tarefa futura.
- A negociação usa NPCs de treino, não NPCs finais de lore.
- O save continua usando apenas o slot `primary`.
