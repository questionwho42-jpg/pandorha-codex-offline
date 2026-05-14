# SpellCastBuilderService Para Usuario

Este modulo prepara uma conjuracao, mas ainda nao solta a magia.

Ele pega a intencao do usuario, confere se a magia existe, calcula o custo de EE, confirma se o conjurador tem energia suficiente e cria um comando tecnico chamado `cast-spell`.

Nesta etapa o comando fica pronto para o motor, mas nao gasta energia, nao rola ataque, nao causa dano e nao aplica metamagia. Isso deixa a proxima tela de Magia segura para testar sem mudar combate, banco ou ficha real.
