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
