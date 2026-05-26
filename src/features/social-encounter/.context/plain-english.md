# Plain English

# SocialEncounterService Para Usuario

Este modulo calcula uma negociacao social simples sem mostrar tela ainda.

Ele consegue iniciar uma conversa com um NPC de treino e resolver um apelo como sucesso ou falha. Sucesso reduz o HP mental do NPC e avanca a trilha de persuasao. Falha reduz a paciencia do NPC. Se o NPC for convencido ou perder toda a paciencia, a negociacao termina.

A alternativa seria colocar essa logica direto na aba Relacoes, mas isso dificultaria testar e salvar o estado depois. Separar em um servico puro deixa a futura UI mais simples e segura.

T44 adiciona a primeira tela: o usuario pode iniciar uma negociacao de treino, fazer um apelo deterministico e salvar/carregar o resultado.

T46 prepara o proximo passo: um servico separado ja consegue transformar uma rolagem social auditavel em resultado de apelo, mas ainda nao muda a tela por conta propria.

T47 liga esse calculo a tela. Agora o usuario escolhe um personagem criado na sessao como negociador, faz um apelo, ve a rolagem contra DC e depois o resultado e aplicado na conversa com o NPC de treino.

T49 registra uma consequencia no estado do mundo quando a negociacao termina. Se o NPC for convencido, ou se a conversa for perdida, essa consequencia aparece na tela e volta depois de salvar, recarregar e carregar o save.

T50 prepara as escolhas de argumento. O codigo agora sabe transformar uma escolha como Persuadir, Barganhar ou Pressionar em um modificador para o apelo social, mas a tela ainda nao mostra esse seletor nesta etapa.

T51 mostra esse seletor na aba Relacoes. O usuario pode escolher Persuadir, Barganhar ou Pressionar antes de fazer o apelo; Barganhar, por exemplo, aparece com bonus +1 na rolagem social.

T52 melhora o registro da conversa. Quando o usuario usa Barganhar, o log passa a dizer que o apelo foi feito com Barganhar, e essa mensagem continua voltando depois de salvar e carregar.

T55 registra tambem qual opcao de dialogo foi escolhida. Assim, a conversa pode voltar para a fala certa depois de salvar e carregar, sem criar um novo formato de save.

T56 mostra essa conversa na aba Relacoes. O usuario ve a fala da Corretora de Treino, escolhe uma resposta e essa escolha prepara o argumento usado no apelo social.

## 2026-05-24T07:37:58.933Z

### What This Module Does
A conversa agora consegue mostrar falas que existem, mas ainda nao podem ser escolhidas. O jogador ve o motivo do bloqueio e o botao fica desativado ate a negociacao ter HP mental suficiente. Isso evita esconder opcoes e impede que uma escolha bloqueada seja enviada diretamente para o motor.

### Alternatives
- Keep notes manually: lower setup cost, higher chance of drift.
- Store notes centrally: easier search, weaker module ownership.
- Use this bridge: consistent local memory with controlled write scope.

## 2026-05-24T07:59:50.343Z

### What This Module Does
A tela de Relacoes agora consegue usar uma segunda conversa de treino. Quando o jogador escolhe o Informante de Treino e inicia a negociacao, ele ve falas proprias daquele NPC; pressionar aparece bloqueado porque o informante nao aguenta esse tipo de abordagem no estado inicial.

### Alternatives
- Keep notes manually: lower setup cost, higher chance of drift.
- Store notes centrally: easier search, weaker module ownership.
- Use this bridge: consistent local memory with controlled write scope.

## 2026-05-25T23:08:57.238Z

### What This Module Does
A negociação social agora tem um roteiro de teste mais claro. Além da Corretora de Treino, o guia explica como testar o Informante de Treino: a opção Pressionar aparece bloqueada quando o personagem não tem HP mental suficiente, enquanto Barganhar continua liberada para seguir a conversa, fazer o apelo e salvar/carregar a sessão.

### Alternatives
- Keep notes manually: lower setup cost, higher chance of drift.
- Store notes centrally: easier search, weaker module ownership.
- Use this bridge: consistent local memory with controlled write scope.

## 2026-05-25T23:41:44.155Z

### What This Module Does
Quando a negociação social termina, o jogo agora guarda qual fala ajudou a encerrar a cena. Se o jogador usou Persuadir, Barganhar ou Pressionar, a consequência em WorldState usa um resumo diferente, então o jogador entende qual abordagem funcionou ou quebrou a conversa. O save continua no mesmo formato v4; a mudança aproveita os eventos de diálogo que já eram salvos.

### Alternatives
- Keep notes manually: lower setup cost, higher chance of drift.
- Store notes centrally: easier search, weaker module ownership.
- Use this bridge: consistent local memory with controlled write scope.
