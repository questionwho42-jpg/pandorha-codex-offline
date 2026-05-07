# Combat Encounter Plain English

Este módulo resolve um ataque simples de combate.

Ele coloca o comando de ataque em uma fila, rola o teste contra a CA do alvo, calcula o dano quando o ataque acerta e cria um pequeno registro de eventos. O HP final do alvo é calculado a partir desse registro, em vez de ser alterado diretamente.

Na T22B, esse módulo ganhou uma tela no navegador. Ela mostra Aria atacando um Guarda de Treino, o HP do alvo, o resultado do último ataque e o log do encontro. Ainda é um treino fixo, não um combate completo.

Na T22C, a tela passou a ter tres alvos de treino: Guarda de Treino, Baluarte de Treino e Duelista de Treino. Trocar o alvo reinicia o HP, o ultimo resultado e o log para o usuario testar o combate de forma mais clara.

Na T22D, os personagens criados na sessao tambem podem aparecer como atacante no combate. Por enquanto isso muda o nome usado no log; ainda nao usa HP real, equipamento ou dano da ficha.

## Alternativas

- Calcular tudo direto no botão da interface: seria mais rápido, mas misturaria UI e regra de combate.
- Criar primeiro um serviço puro: é o caminho atual, porque permite testar combate antes de colocar a tela no navegador.
- Criar combate completo com turno, iniciativa e grid agora: seria mais próximo do jogo final, mas teria risco alto demais para uma única tarefa.
