# SocialEncounterService Para Usuario

Este modulo calcula uma negociacao social simples sem mostrar tela ainda.

Ele consegue iniciar uma conversa com um NPC de treino e resolver um apelo como sucesso ou falha. Sucesso reduz o HP mental do NPC e avanca a trilha de persuasao. Falha reduz a paciencia do NPC. Se o NPC for convencido ou perder toda a paciencia, a negociacao termina.

A alternativa seria colocar essa logica direto na aba Relacoes, mas isso dificultaria testar e salvar o estado depois. Separar em um servico puro deixa a futura UI mais simples e segura.
