# Guia De Usuario: Compendio

Este guia mostra como validar a aba `Compendio` no navegador. O indice atual combina entradas curadas com entradas geradas estaticamente a partir de regras oficiais ja versionadas.

## O Que Ja Funciona

- Voce pode abrir o app em `http://localhost:5173/` ou `http://127.0.0.1:5173/`.
- A aba `Compendio` permite buscar por texto livre, como `Vanguarda`, `contramagia` e `descanso`.
- O filtro de categoria permite alternar entre `Todas`, `Criacao de ficha`, `Ancestralidade`, `Classe`, `Antecedente`, `Sistema: Sobrevivencia`, `Sistema: Combate` e `Sistema: Magia`.
- Cada resultado mostra categoria, titulo, resumo e fonte por arquivo e linha.
- Selecionar uma entrada mostra o mesmo resumo com a fonte detalhada no painel lateral.

## Como Validar No Navegador

1. Abra `http://localhost:5173/`.
2. Clique em `Compendio`.
3. Busque `Vanguarda` e confirme resultado relacionado a classe ou regra indexada.
4. Busque `contramagia` e filtre por `Sistema: Magia`.
5. Busque `descanso` e filtre por `Sistema: Sobrevivencia`.
6. Filtre por `Sistema: Combate` e confirme que os resultados mudam sem erro de console.
7. Selecione uma entrada e confirme que a fonte aparece como `arquivo:linha`.

## Limites Desta Versao

- O indice e estatico e versionado no repositorio.
- O navegador nao faz parsing de Markdown em runtime.
- O Compendio nao altera regras, save, banco SQLite, Worker ou estado do personagem.
- Os resumos gerados sao metadados de descoberta; `docs/system/` continua sendo a fonte soberana das regras.
- Busca semantica, embeddings, snippets ricos e links profundos ficam para gates futuros.
