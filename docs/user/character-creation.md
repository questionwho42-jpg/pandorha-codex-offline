# Guia De Usuário: Criar Personagem

Este guia mostra como testar a criação de personagem que existe hoje no Pandorha Engine. Ele cobre a tela atual do navegador, a Regra dos 6/6 e os erros mais comuns.

## O Que Já Funciona

- Você pode abrir o app em `http://localhost:5173/`.
- A tela `Personagens` permite criar um personagem básico.
- O personagem criado aparece na `Listagem de personagens`.
- O formulário valida a Regra dos 6/6 antes de aceitar o personagem.
- Os erros aparecem em português e dizem o que precisa ser corrigido.

## Limites Desta Versão

- O personagem existe apenas na sessão atual do navegador. Se você recarregar a página, ele será perdido.
- As escolhas de Ancestralidade, Classe e Antecedente ainda são fixas: `Humano`, `Vanguarda` e `Abrigo da Fé`.
- A ficha completa, persistência real, banco SQLite/OPFS e compêndio ainda serão implementados em tarefas futuras.

## Como Criar Um Personagem Válido

1. Abra `http://localhost:5173/`.
2. Clique em `Personagens`.
3. Preencha `Nome`.
4. Preencha `Conceito`.
5. Mantenha `Nível` como `1`.
6. Distribua os `Eixos` para somarem exatamente `6`.
7. Distribua as `Aplicações` para somarem exatamente `6`.
8. Clique em `Criar personagem`.
9. Confirme que o personagem aparece na `Listagem de personagens`.

## Exemplo Para Testar

Use estes valores para confirmar que o fluxo está funcionando:

| Campo | Valor |
| :--- | :--- |
| Nome | Lira da Ponte |
| Conceito | Guardiã exilada que protege caravanas |
| Ancestralidade | Humano |
| Classe | Vanguarda |
| Antecedente | Abrigo da Fé |
| Nível | 1 |
| Físico | 3 |
| Mental | 2 |
| Social | 1 |
| Conflito | 3 |
| Interação | 1 |
| Resistência | 2 |

Depois de clicar em `Criar personagem`, a lista deve mostrar `Lira da Ponte`, o conceito informado, o nível e os valores de Eixos e Aplicações.

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

## Fontes De Regra E Implementação

- `docs/system/survival/00-mecanicas-fundamentais.md`: define a Regra dos 6/6, os Eixos, as Aplicações e os caps por Tier.
- `docs/system/survival/guia-criacao-de-ficha.md`: detalha o processo de distribuição de Eixos e Aplicações na criação.
- `src/features/character-create/ui/CharacterCreateForm.svelte`: representa o formulário atual validado no navegador.
