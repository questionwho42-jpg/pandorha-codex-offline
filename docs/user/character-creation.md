# Guia De Usuário: Criar Personagem

Este guia mostra como testar a criação de personagem que existe hoje no Pandorha Engine. Ele cobre a tela atual do navegador, a Regra dos 6/6 e os erros mais comuns.

## O Que Já Funciona

- Você pode abrir o app em `http://localhost:5173/`.
- A tela `Personagens` permite criar um personagem básico.
- O personagem criado aparece na `Listagem de personagens`.
- O formulário valida a Regra dos 6/6 antes de aceitar o personagem.
- O formulário permite escolher uma das 6 ancestralidades oficiais.
- O formulário permite escolher exatamente 3 traços da ancestralidade selecionada.
- Os 3 traços escolhidos aparecem na `Listagem de personagens` com nome e descrição do catálogo atual.
- O formulário permite escolher classes e antecedentes do catálogo atual.
- Ao criar um personagem novo, o app concede o kit inicial da classe no Inventário usando o ledger persistido existente.
- Os controles `Salvar sessão` e `Carregar save` preservam personagens e traços escolhidos no armazenamento local SQLite WASM/OPFS do navegador.
- A aba `Compêndio` permite consultar o catálogo curado atual.
- Os erros aparecem em português e dizem o que precisa ser corrigido.

## Limites Desta Versão

- O save usa um único slot local chamado `primary`; não há autosave, múltiplos slots ou sincronização em nuvem.
- Os traços escolhidos ficam registrados na ficha salva, mas seus efeitos mecânicos ainda não são aplicados.
- O kit inicial não é equipado automaticamente; itens sem perfil aprovado aparecem no Inventário sem botão de equipar.
- A ficha exibida ainda é parcial e não oferece edição de personagem depois da criação.

## Como Criar Um Personagem Válido

1. Abra `http://localhost:5173/`.
2. Clique em `Personagens`.
3. Preencha `Nome`.
4. Preencha `Conceito`.
5. Escolha uma `Ancestralidade`.
6. Escolha exatamente `3` `Traços de ancestralidade`.
7. Mantenha `Nível` como `1`.
8. Distribua os `Eixos` para somarem exatamente `6`.
9. Distribua as `Aplicações` para somarem exatamente `6`.
10. Clique em `Criar personagem`.
11. Confirme que o personagem aparece na `Listagem de personagens` com os 3 traços escolhidos.
12. Entre em `Inventário`, selecione o personagem e confirme que o kit inicial da classe aparece como itens carregados.
13. Clique em `Salvar sessão`.
14. Recarregue a página, volte para `Personagens` e clique em `Carregar save`.
15. Confirme que o personagem salvo voltou para a listagem com os mesmos 3 traços e que o Inventário restaurou o kit inicial.

## Exemplo Para Testar

Use estes valores para confirmar que o fluxo está funcionando:

| Campo | Valor |
| :--- | :--- |
| Nome | Lira da Ponte |
| Conceito | Guardiã exilada que protege caravanas |
| Ancestralidade | Humano |
| Traços | Diligência Erudita, Língua de Prata, Vontade Indomável |
| Classe | Vanguarda |
| Antecedente | Acólito |
| Nível | 1 |
| Físico | 3 |
| Mental | 2 |
| Social | 1 |
| Conflito | 3 |
| Interação | 1 |
| Resistência | 2 |

Depois de clicar em `Criar personagem`, a lista deve mostrar `Lira da Ponte`, o conceito informado, o nível, os 3 traços escolhidos e os valores de Eixos e Aplicações.

## Regra Dos 6/6

Na criação atual, o personagem precisa seguir duas somas separadas:

- `Eixos`: `Físico + Mental + Social = 6`.
- `Aplicações`: `Conflito + Interação + Resistência = 6`.

No Nível 1, nenhum Eixo ou Aplicação deve ficar abaixo de `1` ou acima de `3`. Isso segue o limite de Tier I.

## Como Corrigir Erros Comuns

Se aparecer `Os Eixos somam 8`, reduza algum valor de `Físico`, `Mental` ou `Social` até a soma ficar exatamente `6`.

Se aparecer `As Aplicações somam 3`, aumente algum valor de `Conflito`, `Interação` ou `Resistência` até a soma ficar exatamente `6`.

Se aparecer uma mensagem pedindo `nome`, `conceito` ou campos numéricos, revise os campos obrigatórios antes de tentar criar novamente.

Se aparecer uma mensagem de limite do nível atual, deixe o campo indicado em no máximo `3` enquanto o personagem estiver no Nível 1.

Se aparecer uma mensagem pedindo exatamente `3 traços`, marque ou desmarque traços até o contador mostrar `Selecionados: 3/3`.

Se você trocar a ancestralidade, a lista de traços muda. Confira novamente se os 3 traços escolhidos pertencem à ancestralidade atual.

## Fontes De Regra E Implementação

- `docs/system/survival/00-mecanicas-fundamentais.md`: define a Regra dos 6/6, os Eixos, as Aplicações e os caps por Tier.
- `docs/system/survival/guia-criacao-de-ficha.md`: detalha o processo de distribuição de Eixos e Aplicações na criação.
- `docs/system/survival/01-01-humanos.md` a `docs/system/survival/01-06-feras.md`: definem as ancestralidades e suas listas de 10 traços.
- `src/features/character-create/ui/CharacterCreateForm.svelte`: representa o formulário atual validado no navegador.
