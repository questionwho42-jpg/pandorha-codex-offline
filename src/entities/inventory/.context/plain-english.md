# Inventory Para Usuario

Este modulo guarda a historia dos itens carregados por cada personagem.

Em vez de salvar uma soma pronta, ele registra eventos de adicionar, alterar
quantidade e remover. O inventario atual pode ser reconstruido ao repetir essa
historia, mantendo o resultado auditavel.

Quando um item e equipado, outro historico aponta para o `entryId` desse item.
Assim o inventario continua dizendo "o personagem carrega isto" e o loadout
separado diz "isto esta na arma, escudo ou armadura".
