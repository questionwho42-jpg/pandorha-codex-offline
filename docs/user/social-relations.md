# Relações Sociais

Este guia explica como testar a primeira versão da aba `Relações` no navegador.

## O que já funciona

- Ver facções de treino.
- Ver `Fama`, `Infâmia`, `Dívida`, `Favores`, `Intriga` e `Status`.
- Ver clocks ativos de `Retaliação` criados por pressão social.
- Ver `Relações por NPC` agrupadas por facção depois que uma negociação com `Pressionar` registra pressão individual.
- Filtrar `Relações por NPC` por `Todos`, `Atenção`, `Estáveis`, `Aliados` e `Inimigos`.
- Invocar um favor `Tier 1`.
- Abater `Dívida Tier 1`.
- Salvar e carregar o estado social pelo save local do navegador.

## Como testar

1. Abra `http://127.0.0.1:5173/`.
2. Clique em `Relações`.
3. Na `Guilda dos Ladrões de Treino`, clique em `Invocar favor Tier 1`.
4. Confirme que a dívida muda para `Dívida 1/3` e a intriga muda para `Intriga 1`.
5. Clique em `Salvar sessão`.
6. Recarregue a página.
7. Clique em `Carregar save`.
8. Volte para `Relações` e confirme que dívida e intriga foram restauradas.
9. Quando uma negociação social criar retaliação, confirme que a facção correspondente mostra `Retaliação: ... - 1/4 fatias` e que `Relações por NPC` mostra o NPC tensionado dentro do grupo da facção.
10. Use o filtro `Atenção` para ver apenas NPCs tensionados, com pressão ou inimigos; depois volte para `Todos`.

## Como corrigir erros comuns

- Se o botão de favor estiver bloqueado, a dívida já está perto do limite.
- Se `Abater dívida Tier 1` estiver bloqueado, a facção ainda não tem dívida ativa.
- Se o save falhar, tente recarregar a página e usar `Carregar save` antes de salvar novamente.

## Limitações atuais

- As facções são de treino.
- A relação individual por NPC ainda aparece apenas para pressão social registrada.
- Os filtros são apenas de leitura; eles não alteram save, clocks ou relação individual.
- Só existe favor `Tier 1`.
- Clocks de retaliação avançam apenas por gatilho explícito `social-pressure`; não avançam sozinhos por tempo.
- Só existe um slot de save local.
