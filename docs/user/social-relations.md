# Relações Sociais

Este guia explica como testar a primeira versão da aba `Relações` no navegador.

## O que já funciona

- Ver facções de treino.
- Ver `Fama`, `Infâmia`, `Dívida`, `Favores`, `Intriga` e `Status`.
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

## Como corrigir erros comuns

- Se o botão de favor estiver bloqueado, a dívida já está perto do limite.
- Se `Abater dívida Tier 1` estiver bloqueado, a facção ainda não tem dívida ativa.
- Se o save falhar, tente recarregar a página e usar `Carregar save` antes de salvar novamente.

## Limitações atuais

- As facções são de treino.
- Não há NPCs, diálogos, domínio regional ou Teste de Prestígio.
- Só existe favor `Tier 1`.
- Só existe um slot de save local.
