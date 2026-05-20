# Negociação Social

Este guia explica como testar a primeira negociação social visível do Pandorha Engine.

## O Que Já Funciona

- A aba `Relações` mostra NPCs de treino para negociação.
- Você pode iniciar uma negociação com a `Corretora de Treino`.
- O botão `Fazer apelo` aplica um resultado determinístico de treino.
- A tela mostra HP mental, paciência, persuasão, atitude, status e log.
- O save local v4 preserva o estado da negociação.

## Como Testar No Navegador

1. Abra `http://127.0.0.1:5173/`.
2. Clique em `Relações`.
3. Em `Negociação social`, selecione `Corretora de Treino`.
4. Clique em `Iniciar negociação`.
5. Confirme que aparecem `HP mental 8/8`, `Paciência 6/6` e `Persuasão 0/3`.
6. Clique em `Fazer apelo`.
7. Confirme que o log mostra o apelo e que a persuasão avançou.
8. Clique em `Salvar sessão`.
9. Recarregue a página.
10. Clique em `Carregar save`.
11. Volte para `Relações` e confirme que a negociação voltou com HP mental, progresso e log.

## Limitações Atuais

- O apelo ainda é determinístico; não há rolagem social real.
- Não há árvore de diálogo, escolhas de argumento ou consequências narrativas.
- O NPC não altera `WorldState` nem libera missões.
- O save continua usando apenas o slot `primary`.
