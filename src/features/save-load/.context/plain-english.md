# Save Load In Plain Portuguese

O SaveLoadService prepara o pacote do save antes de mandar para o Worker e confere o pacote quando ele volta.

Ele garante que personagens e fatos do mundo estejam em um formato valido, identifica saves corrompidos e percebe quando um save pertence a uma versao futura ainda nao suportada.

O primeiro save real tambem grava uma marca tecnica escondida para lembrar a versao do save e quando ele foi feito.

Agora ja existe controle no navegador para salvar e carregar a sessao atual. O primeiro ciclo guarda personagens e fatos do mundo no proprio navegador e consegue restaurar os personagens depois de recarregar a pagina.

Ainda existe apenas um slot de save. Tambem nao ha autosave nem tela propria para os fatos do mundo; eles sao preservados por baixo dos panos para nao se perderem em um novo save.

O save agora esta na versao 2. Alem de personagens e fatos do mundo, ele consegue guardar relogios e o estado do acampamento. Saves antigos da versao 1 continuam carregando, mas com acampamento vazio.
