# SocialEncounterService Para Usuario

Este modulo calcula uma negociacao social simples sem mostrar tela ainda.

Ele consegue iniciar uma conversa com um NPC de treino e resolver um apelo como sucesso ou falha. Sucesso reduz o HP mental do NPC e avanca a trilha de persuasao. Falha reduz a paciencia do NPC. Se o NPC for convencido ou perder toda a paciencia, a negociacao termina.

A alternativa seria colocar essa logica direto na aba Relacoes, mas isso dificultaria testar e salvar o estado depois. Separar em um servico puro deixa a futura UI mais simples e segura.

T44 adiciona a primeira tela: o usuario pode iniciar uma negociacao de treino, fazer um apelo deterministico e salvar/carregar o resultado.

T46 prepara o proximo passo: um servico separado ja consegue transformar uma rolagem social auditavel em resultado de apelo, mas ainda nao muda a tela por conta propria.

T47 liga esse calculo a tela. Agora o usuario escolhe um personagem criado na sessao como negociador, faz um apelo, ve a rolagem contra DC e depois o resultado e aplicado na conversa com o NPC de treino.

T49 registra uma consequencia no estado do mundo quando a negociacao termina. Se o NPC for convencido, ou se a conversa for perdida, essa consequencia aparece na tela e volta depois de salvar, recarregar e carregar o save.

T50 prepara as escolhas de argumento. O codigo agora sabe transformar uma escolha como Persuadir, Barganhar ou Pressionar em um modificador para o apelo social, mas a tela ainda nao mostra esse seletor nesta etapa.
