# SocialEncounterService Para Usuario

Este modulo calcula uma negociacao social simples sem mostrar tela ainda.

Ele consegue iniciar uma conversa com um NPC de treino e resolver um apelo como sucesso ou falha. Sucesso reduz o HP mental do NPC e avanca a trilha de persuasao. Falha reduz a paciencia do NPC. Se o NPC for convencido ou perder toda a paciencia, a negociacao termina.

A alternativa seria colocar essa logica direto na aba Relacoes, mas isso dificultaria testar e salvar o estado depois. Separar em um servico puro deixa a futura UI mais simples e segura.

T44 adiciona a primeira tela: o usuario pode iniciar uma negociacao de treino, fazer um apelo deterministico e salvar/carregar o resultado.

T46 prepara o proximo passo: um servico separado ja consegue transformar uma rolagem social auditavel em resultado de apelo, mas ainda nao muda a tela por conta propria.
