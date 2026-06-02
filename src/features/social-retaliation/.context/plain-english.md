# Explicação Para Leigos

Esta parte prepara o jogo para avançar relógios de retaliação social quando uma consequência explícita mandar.

Hoje, quando o jogador pressiona uma facção até gerar retaliação, o jogo pode criar um relógio como `Retaliação: Liga Mercante de Treino - 0/4 fatias`. A T71 adiciona uma forma controlada de avançar esse relógio depois, mas não faz isso sozinha e não muda a tela.

Alternativas:

- Avanço automático: mais rápido para o jogador, mas arriscado sem regra oficial de quando a facção deve agir.
- Avanço manual por gatilho explícito: mais seguro para o motor, porque cada avanço precisa ter um motivo registrado.
- Guardar tudo em `WorldState`: simples no curto prazo, mas ruim para escalar porque mistura flags narrativas com progresso durável de relacionamento.

T83 adiciona uma trava antes do avanço. Hoje, só pressão social explícita pode mandar o relógio andar. Descanso, passagem de tempo, nova cena social ou ação manual genérica não avançam o relógio enquanto não houver regra oficial dizendo quando isso deve acontecer.
