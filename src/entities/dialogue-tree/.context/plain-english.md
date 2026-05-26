# Plain English

# DialogueTree Para Usuario

Este módulo guarda a primeira conversa estruturada da aba `Relações`. Ele define o texto inicial da Corretora de Treino, as opções que o usuário pode escolher e qual resposta aparece depois.

Ele ainda não é uma árvore narrativa completa. Nesta fase, a conversa só ajuda a escolher o argumento social antes do teste de apelo.

## 2026-05-24T07:38:10.771Z

### What This Module Does
A arvore de dialogo agora pode dizer que uma fala exige uma quantidade minima de HP mental. Por enquanto isso so afeta a opcao Pressionar da Corretora de Treino. As outras falas continuam livres e a arvore segue sendo um catalogo fixo, sem alterar o banco real.

### Alternatives
- Keep notes manually: lower setup cost, higher chance of drift.
- Store notes centrally: easier search, weaker module ownership.
- Use this bridge: consistent local memory with controlled write scope.

## 2026-05-24T07:59:37.766Z

### What This Module Does
A conversa agora existe para o Informante de Treino. Ele oferece tres caminhos: persuadir, barganhar ou pressionar. Como o informante comeca fragil, a opcao de pressionar aparece bloqueada com explicacao, mostrando ao jogador que aquela fala existe, mas nao esta segura para aquela cena.

### Alternatives
- Keep notes manually: lower setup cost, higher chance of drift.
- Store notes centrally: easier search, weaker module ownership.
- Use this bridge: consistent local memory with controlled write scope.

## 2026-05-26T09:21:25.000Z

### What This Module Does
A conversa agora tambem existe para o Capitão de Treino. Ele comenta dever, moral da tropa e custo de escolta. O jogador pode persuadir, barganhar ou pressionar, mas pressionar exige HP mental 8 para evitar uma coerção que quebre a moral da tropa.

### Alternatives
- Criar um NPC novo: daria mais liberdade, mas exigiria mais catálogo e risco de escopo.
- Alterar facções ou Infâmia: seria uma consequência mais forte, mas cruzaria outros módulos.
- Expandir só a árvore do capitão: entrega conteúdo visível com baixo risco e sem mudar o save.

## 2026-05-26T15:45:00.000Z

### What This Module Does
Agora existe um teste rápido para conferir se todas as conversas curtas de treino seguem o mesmo formato. Ele verifica se cada NPC de treino tem uma abertura, três respostas e as três escolhas principais em ordem, sem ponteiros quebrados.

### Alternatives
- Conferir manualmente cada nova árvore: mais simples no começo, mas fácil de esquecer.
- Criar uma pipeline completa de autoria: mais poderosa, mas pesada para o momento.
- Usar este smoke estático: barato, repetível e suficiente para proteger os seeds atuais.

## 2026-05-26T18:55:00.000Z

### What This Module Does
As opções de diálogo agora podem exigir uma flag de mundo ou Fama mínima com a facção do NPC. A barganha do capitão usa essa regra de Fama, mas o save e o banco continuam iguais.

### Alternatives
- Criar uma linguagem completa de requisitos: mais flexível, mas cedo demais.
- Deixar só em testes: mais simples, mas não protegeria a UI.
- Campos opcionais planos: suficientes para a próxima fase e fáceis de validar.
