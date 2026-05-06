# Resolution - Explicacao Para Leigos

Este modulo calcula se uma acao incerta deu certo ou falhou.

Ele pede ao modulo de dados uma rolagem de d20 e soma nivel, eixo, aplicacao e bonus de item. Depois compara esse total com a dificuldade da acao.

O resultado pode ser:

- `criticalSuccess`: passou por 10 ou mais.
- `success`: atingiu a dificuldade.
- `successWithCost`: quase falhou, mas o Mestre pode oferecer um custo.
- `failure`: falhou.

Nesta versao, 20 natural garante pelo menos sucesso, mas so vira critico se a soma final tambem passar por 10 ou mais. Um 1 natural vira falha.

Ainda nao existe tela para usar isso no navegador. Essa base sera usada por combate, magia, armadilhas e exploracao em etapas futuras.
