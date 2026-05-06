# Dice - Explicacao Para Leigos

Este modulo e o lugar central onde o Pandorha Engine rola dados.

Ele existe para que as proximas partes do jogo, como testes, combate, dano e magia, usem a mesma forma de rolar dados. Cada rolagem guarda um pequeno registro de auditoria em memoria, com motivo, resultado natural, horario e identificador.

Hoje ele nao salva esse historico no banco. Isso foi deixado para uma etapa futura, quando o projeto tiver persistencia real de rolagens.

Alternativas consideradas:

- Usar aleatoriedade direta em cada tela ou servico: simples no inicio, mas dificil de testar e auditar depois.
- Centralizar em `DiceService`: exige um modulo a mais agora, mas permite testes previsiveis, auditoria e regras consistentes.

A escolha atual e centralizar em `DiceService`.
