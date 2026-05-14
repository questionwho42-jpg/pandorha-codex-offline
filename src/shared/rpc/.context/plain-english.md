# RPC In Plain Portuguese

RPC e o contrato de recados entre a tela do jogo e o Worker que vai cuidar do banco local.

Nesta etapa o jogo ainda não salva no disco. O que existe agora é o formato seguro das mensagens: iniciar banco, salvar snapshot e carregar snapshot.

O fake serve para testar esse contrato sem abrir banco real. Isso reduz risco antes de ligar SQLite, OPFS e Worker no navegador.
