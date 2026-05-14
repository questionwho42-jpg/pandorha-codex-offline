# HexcrawlMovementService Para Usuario

Este módulo decide se o grupo pode andar de um hexágono para outro no mapa de treino.

Ele só permite movimento para hexágonos vizinhos, bloqueia caminhos marcados como impedidos e gera mensagens para o log, como "o grupo avançou" ou "um encontro pode acontecer depois". Ele ainda não rola dados, não salva exploração e não cria encontros reais.

Na T31 ele também ganhou uma tela simples: o usuário clica em `Exploração`, vê sete hexágonos e pode mover o grupo para um vizinho. Tudo reinicia ao recarregar a página.
