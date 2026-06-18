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

A aba Combate agora consulta esse equipamento ativo. O Inventario continua sendo
o lugar onde o usuario muda arma, escudo e armadura; o Combate apenas le o
resultado para calcular o treino.

O Cinto de Pocoes continua sendo um consumivel carregado pelo personagem. Quando
o Combate usa uma pocao do cinto, ele pede ao Inventario para consumir 1 unidade
da mesma pilha salva. Isso nao cria cura real nem muda HP; apenas baixa a
quantidade do item.

A tela tambem pode mostrar itens de kit inicial que ainda nao tem perfil de
combate. Eles aparecem como itens carregados e contam para carga, mas nao
mostram botao de equipar enquanto o catalogo nao aprovar o perfil mecanico.

Quando o app cria um personagem novo, ele usa o mesmo Inventario para adicionar
o kit inicial da classe. Isso cria eventos iguais aos de carregar itens
manualmente, entao o save e o load continuam funcionando pelo mesmo caminho.
