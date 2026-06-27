# Guia De Usuario: Compendio

Este guia mostra como validar a aba `Compendio` no navegador. O indice atual combina entradas curadas com entradas geradas estaticamente a partir de regras oficiais ja versionadas.

## O Que Ja Funciona

- Voce pode abrir o app em `http://localhost:5173/` ou `http://127.0.0.1:5173/`.
- A aba `Compendio` permite buscar por texto livre, como `Vanguarda`, `contramagia` e `descanso`.
- O filtro de categoria permite alternar entre `Todas`, `Criacao de ficha`, `Ancestralidade`, `Classe`, `Antecedente`, `Sistema: Sobrevivencia`, `Sistema: Combate` e `Sistema: Magia`.
- A busca textual ranqueia resultados de forma deterministica: titulo primeiro, depois tags/categoria e por fim resumo/texto indexado.
- A lista mostra 20 resultados por pagina, com navegacao `Anterior` e `Proxima` quando houver mais paginas.
- Cada resultado mostra categoria, titulo, resumo e fonte por arquivo e linha.
- Selecionar uma entrada mostra o mesmo resumo com a fonte detalhada no painel lateral.
- Quando uma busca ou filtro nao retorna nada, o estado vazio mostra uma orientacao contextual e permite limpar busca e filtros.

## Como Validar No Navegador

1. Abra `http://localhost:5173/`.
2. Clique em `Compendio`.
3. Busque `Vanguarda` e confirme resultado relacionado a classe ou regra indexada.
4. Busque `contramagia` e filtre por `Sistema: Magia`.
5. Busque `descanso` e filtre por `Sistema: Sobrevivencia`.
6. Filtre por `Sistema: Combate` e confirme que os resultados mudam sem erro de console.
7. Quando a lista tiver mais de uma pagina, use `Proxima` e `Anterior` e confirme que o contador de pagina muda sem perder a fonte dos itens.
8. Busque um termo inexistente, confirme o estado vazio e clique em `Limpar busca e filtros`.
9. Selecione uma entrada e confirme que a fonte aparece como `arquivo:linha`.

## Limites Desta Versao

- O indice e estatico e versionado no repositorio.
- O ranking e textual/deterministico; nao usa IA, embeddings nem busca semantica.
- O navegador nao faz parsing de Markdown em runtime.
- O Compendio nao altera regras, save, banco SQLite, Worker ou estado do personagem.
- Os resumos gerados sao metadados de descoberta; `docs/system/` continua sendo a fonte soberana das regras.
- Busca semantica, embeddings, snippets ricos e links profundos ficam para gates futuros.
