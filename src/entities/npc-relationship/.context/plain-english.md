# Explicação Para Leigos

Esta parte cria o núcleo de relação individual com um NPC específico. Ela não muda a tela ainda e não mexe no salvamento atual do jogo.

Hoje o jogo já sabe lidar com reputação de facção, como Fama e Infâmia. A T72 separa isso da relação com uma pessoa específica: um capitão, informante ou negociador pode ficar mais desconfiado, hostil ou virar inimigo durável sem isso virar automaticamente uma regra de facção inteira.

Alternativas:

- Guardar em `WorldState`: simples no curto prazo, mas mistura flags narrativas com relação durável e dificulta save/load.
- Usar só Fama/Infâmia: reaproveita sistema existente, mas perde a diferença entre "a facção odeia o grupo" e "este NPC específico odeia o grupo".
- Criar entidade dedicada: exige mais cuidado, mas é o caminho mais seguro para persistência, validação e evolução futura.
