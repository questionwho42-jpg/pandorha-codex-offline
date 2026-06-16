# Inventario E Equipamento

Abra `http://127.0.0.1:5173/`, entre em `Inventario` e selecione um personagem criado na sessao.

## Fluxo Atual

1. Use `Carregar` para adicionar armas, escudos e armaduras do catalogo.
2. Use `Carregar 1`, `+1` e `Consumir 1` para gerenciar consumiveis.
3. Use `Equipar arma`, `Equipar escudo` e `Vestir armadura` para preencher `Arma`, `Escudo` e `Armadura`.
4. Use `Desequipar` antes de remover qualquer item equipado; a tela mostra `Desequipe antes de remover` quando o item ainda está ativo.
5. Salve a sessao, recarregue a pagina e use `Carregar save` para confirmar que inventario e equipamento voltam no save local.

## Limites Atuais

- Equipar muda apenas o loadout persistido do inventario; o combate ainda usa seletores locais de treino.
- Durabilidade, loadout de combate, cinto de pocoes, equipamento inicial e HP real persistido continuam fora desta entrega.
- O save usa um unico slot local `primary`.
