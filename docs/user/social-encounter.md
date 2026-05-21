# Negociação Social

Este guia explica como testar a negociação social visível do Pandorha Engine.

## O Que Já Funciona

- A aba `Relações` mostra NPCs de treino para negociação.
- Você pode iniciar uma negociação com a `Corretora de Treino`.
- O negociador vem dos personagens criados ou carregados na sessão.
- O seletor `Argumento` oferece `Persuadir`, `Barganhar` e `Pressionar`.
- `Barganhar` mostra `Modificador do argumento: +1` e adiciona esse bônus ao apelo social.
- A tela mostra rolagem, DC, HP mental, paciência, persuasão, atitude, status e log.
- Quando a negociação termina, a consequência é registrada em `WorldState`.
- O save local v4 preserva estado da negociação, eventos, log e consequência.

## Como Testar No Navegador

1. Abra `http://127.0.0.1:5173/`.
2. Crie um personagem válido em `Personagens`, ou clique em `Carregar save` se já houver um personagem salvo.
3. Clique em `Relações`.
4. Em `Negociação social`, selecione `Corretora de Treino`.
5. Selecione o argumento `Barganhar`.
6. Confirme que aparece `Modificador do argumento: +1`.
7. Clique em `Iniciar negociação`.
8. Confirme que aparecem `HP mental 8/8`, `Paciência 6/6` e `Persuasão 0/3`.
9. Clique em `Fazer apelo`.
10. Confirme que a rolagem mostra `Bônus 1` e que o log cita `Barganhar`.
11. Repita `Fazer apelo` até convencer o NPC, se quiser validar a consequência.
12. Clique em `Salvar sessão`.
13. Recarregue a página.
14. Clique em `Carregar save`.
15. Volte para `Relações` e confirme que negociação, log e consequência voltaram.

## Limitações Atuais

- Ainda não há árvore completa de diálogo.
- `Pressionar` usa apenas modificador `-1`; piora de relação fica para tarefa futura.
- A negociação usa NPCs de treino, não NPCs finais de lore.
- O save continua usando apenas o slot `primary`.
