# Gerenciamento De Inventario Para Usuario

Este modulo coordena quais itens cada personagem carrega. Ele consulta o
catalogo, registra eventos, reconstrui as pilhas atuais e calcula a carga.

Na tela de Inventario, o usuario escolhe um personagem, carrega itens do
catalogo, equipa arma, escudo e armadura, consome unidades e remove o que nao
deseja mais carregar. Se um item estiver equipado, a tela pede para desequipar
antes de remover.

O save v7 guarda o historico de itens carregados e tambem o historico separado
do que esta equipado. Depois do load, o sistema reconstrui os itens e os slots
equipados sem copiar dados do catalogo para o save.
