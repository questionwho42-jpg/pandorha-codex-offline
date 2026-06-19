# Inventario E Equipamento

Abra `http://127.0.0.1:5173/`, entre em `Inventario` e selecione um personagem criado na sessao.

Personagens novos recebem automaticamente o kit inicial da classe quando sao criados. Esses itens aparecem como itens carregados no Inventario e sao salvos pelo mesmo ledger de inventario.

## Fluxo Atual

1. Use `Carregar` para adicionar armas, escudos e armaduras do catalogo.
2. Use `Carregar 1`, `+1` e `Consumir 1` para gerenciar consumiveis, incluindo `Cinto de Poções`.
3. Use `Equipar arma`, `Equipar escudo` e `Vestir armadura` para preencher `Arma`, `Escudo` e `Armadura`.
4. Itens de kit inicial sem perfil mecanico aprovado aparecem no inventario, mas nao exibem acao de equipar nesta fatia.
5. Em equipamentos carregados, use `Marcar danificado`, `Marcar quebrado` e `Reparar` para registrar a condicao manual da durabilidade.
6. Use `Desequipar` antes de remover qualquer item equipado; a tela mostra `Desequipe antes de remover` quando o item ainda esta ativo.
7. Salve a sessao, recarregue a pagina e use `Carregar save` para confirmar que inventario, equipamento e durabilidade voltam no save local.

## Limites Atuais

- Equipar muda o loadout persistido do inventario; a aba `Combate` ja usa esse loadout para arma, escudo e armadura de treino.
- `Cinto de Poções` pode ser carregado como consumivel persistido e usado no `Combate` como acesso rapido de treino.
- `Cota de Malha`, `Arco Curto`, `Cajado`, `Rapieira` e `Armadura Acolchoada de Luxo` sao catalogados para ownership e carga, mas ainda nao tem perfil de combate/loadout.
- Usar o cinto no combate consome 1 unidade do inventario, mas nao cura, nao altera HP real, nao altera HP de treino e nao aplica estados oficiais.
- Durabilidade manual ja mostra `Integro`, `Danificado` e `Quebrado`; item quebrado nao pode ser equipado ate usar `Reparar`.
- Desgaste automatico, penalidade mecanica de item danificado, reparo por Acampamento, cura real por consumivel, HP real persistido e perfis completos para todos os itens de kit inicial continuam fora desta entrega.
- O save usa um unico slot local `primary`.
