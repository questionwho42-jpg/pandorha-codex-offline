# Save Load In Plain Portuguese

O SaveLoadService prepara o pacote do save antes de mandar para o Worker e confere o pacote quando ele volta.

Ele garante que personagens e fatos do mundo estejam em um formato valido, identifica saves corrompidos e percebe quando um save pertence a uma versao futura ainda nao suportada.

O primeiro save real tambem grava uma marca tecnica escondida para lembrar a versao do save e quando ele foi feito.

Nesta etapa ainda nao existe botao no navegador. A parte visivel chega na proxima subtarefa, quando o app ligar este servico ao Worker real.
