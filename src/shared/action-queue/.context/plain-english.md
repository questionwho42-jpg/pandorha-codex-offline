# Action Queue - Explicacao Para Leigos

Este modulo cria uma fila de comandos para o jogo.

Comandos normais entram no fim da fila e saem na mesma ordem em que chegaram. Interrupcoes, como reacoes futuras, passam na frente e a mais recente e resolvida primeiro.

Isso evita que combate, magia ou condicoes sejam resolvidos direto em qualquer parte do codigo. No futuro, tudo devera entrar por essa fila antes de alterar o estado do jogo.

Nesta versao, a fila ainda nao salva eventos no banco, nao muda HP, nao roda combate e nao aparece no navegador.
