# Save Load In Plain Portuguese

O SaveLoadService prepara o pacote do save antes de mandar para o Worker e confere o pacote quando ele volta.

Ele garante que personagens e fatos do mundo estejam em um formato válido, identifica saves corrompidos e percebe quando um save pertence a uma versão futura ainda não suportada.

Nesta etapa ainda não existe botão no navegador. A parte visível chega na próxima subtarefa, quando o app ligar este serviço ao Worker real.
