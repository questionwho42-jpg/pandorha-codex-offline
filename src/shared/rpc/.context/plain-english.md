# RPC In Plain Portuguese

Na versao 6, as mensagens de save tambem carregam o historico usado para reconstruir o inventario.

RPC e o contrato de recados entre a tela do jogo e o Worker que vai cuidar do banco local.

Nesta etapa o jogo ainda não salva no disco. O que existe agora é o formato seguro das mensagens: iniciar banco, salvar snapshot e carregar snapshot.

O fake serve para testar esse contrato sem abrir banco real. Agora tambem existe uma ponte real para o navegador, que espera respostas do Worker, confere se cada resposta pertence ao pedido certo e encerra a espera se o Worker nao responder a tempo.
