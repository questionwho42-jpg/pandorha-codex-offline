# Combat Encounter Plain English

Este módulo resolve um ataque simples de combate.

Ele coloca o comando de ataque em uma fila, rola o teste contra a CA do alvo, calcula o dano quando o ataque acerta e cria um pequeno registro de eventos. O HP final do alvo é calculado a partir desse registro, em vez de ser alterado diretamente.

Na T22B, esse módulo ganhou uma tela no navegador. Ela mostra Aria atacando um Guarda de Treino, o HP do alvo, o resultado do último ataque e o log do encontro. Ainda é um treino fixo, não um combate completo.

Na T22C, a tela passou a ter tres alvos de treino: Guarda de Treino, Baluarte de Treino e Duelista de Treino. Trocar o alvo reinicia o HP, o ultimo resultado e o log para o usuario testar o combate de forma mais clara.

Na T22D, os personagens criados na sessao tambem podem aparecer como atacante no combate. Por enquanto isso muda o nome usado no log; ainda nao usa HP real, equipamento ou dano da ficha.

Na T22E, a tela ganhou uma nocao simples de turno. O jogador ve a rodada, de quem e o turno e quantas acoes restam. Atacar gasta uma acao, e encerrar o turno passa para o alvo de treino e depois volta para o atacante na rodada seguinte. O alvo ainda nao age sozinho.

Na T22F, quando o usuario seleciona um personagem criado na sessao, a tela mostra HP maximo, iniciativa e carga calculados a partir da ficha. Esses valores ainda sao informativos: o ataque, o dano e o HP usado no treino continuam fixos por enquanto.

Na T22G, o dano de treino passou a olhar para a Matriz Fisica do personagem selecionado. Isso significa que dois personagens com valores fisicos diferentes podem causar dano de treino diferente, mas a arma, o dado base e o bonus ainda continuam fixos.

Na T22H, quando chega o turno do alvo de treino, o usuario pode encerrar esse turno e o log registra que o alvo manteve posicao. O alvo ainda nao ataca, nao causa dano e nao tem inteligencia artificial.

Na T22I, quando o alvo chega a 0 HP, a tela mostra que ele foi derrotado e bloqueia novos ataques ou encerramentos de turno. O botao Reiniciar encontro continua disponivel para testar de novo.

Na T85.1, o combate passou a conseguir receber um perfil de arma real vindo do catalogo de equipamentos. Isso ainda nao aparece como selecao visual de arma: e uma ponte tecnica. Quando uma arma como a Espada Longa for entregue ao perfil de ataque, o combate ja sabe usar o dado `1d8`, a Matriz correta e o total deterministico de treino.

Na T87, a aba Combate ganhou um seletor `Arma equipada` para personagens criados na sessao. Ele comeca em `Espada Longa`, pode trocar para outras armas oficiais de treino e muda o resumo do dano mostrado na tela.

Aria continua usando o perfil fixo de treino. O seletor existe para os personagens da sessao, nao para transformar Aria em personagem equipado.

A arma escolhida ainda nao e salva, nao quebra, nao gasta durabilidade e nao verifica proficiencia. Ela so alimenta o perfil de dano local do combate.

Na T88, quando um personagem da sessao ataca com uma arma oficial, o dado da arma passa a ser rolado no momento do ataque. O combate registra no log qual dado foi rolado, qual foi o resultado e qual codigo de auditoria veio do servico de dados.

O calculo de dano continua separado: primeiro o dado da arma e rolado, depois o servico de dano recebe esse numero junto com a Matriz e os modificadores. Armadura, RD, afinidade, proficiencia e desgaste ainda ficam para fases futuras.

Na T89, alguns alvos de treino passaram a ter defesas simples. O Guarda de Treino continua sem defesa especial, o Duelista reduz dano fisico com RD e resistencia, e o Baluarte carrega uma imunidade fisica de treino para validar o contrato.

Essas defesas nao transformam os alvos em monstros oficiais. Elas apenas mostram que o combate consegue mandar RD e afinidades para o servico de dano que ja existia.

Na T91, personagens criados na sessao tambem podem escolher `Armadura equipada` e `Escudo equipado` na aba Combate. O padrao e Couro com Escudo Redondo, mostrado como `CA equipada +3`.

Essa defesa aparece para o jogador conferir o equipamento ativo, mas ainda nao muda ataques recebidos nem dano. Se o jogador escolher uma arma de duas maos, como Arco Longo, junto com escudo, a tela mostra o conflito ate o escudo ser trocado para `Sem escudo`.

Na T92, o alvo de treino passou a fazer um ataque simples quando o turno dele termina e o atacante selecionado e um personagem criado na sessao. Esse ataque olha para a CA do personagem: 10 base, nivel, Fisico, armadura e escudo.

O ataque do alvo serve para testar se a defesa equipada esta auditavel. Ele nao tira HP real, nao causa dano persistente, nao salva nada e nao transforma os alvos de treino em monstros oficiais. Se Aria estiver selecionada, o alvo continua apenas mantendo posicao.

## Alternativas

- Calcular tudo direto no botão da interface: seria mais rápido, mas misturaria UI e regra de combate.
- Criar primeiro um serviço puro: é o caminho atual, porque permite testar combate antes de colocar a tela no navegador.
- Criar combate completo com turno, iniciativa e grid agora: seria mais próximo do jogo final, mas teria risco alto demais para uma única tarefa.
- Salvar a arma equipada agora: mais conveniente, mas exigiria decisao de save version antes de o fluxo visual provar o contrato.
- Fazer o servico de dano rolar o dado internamente: reduziria uma chamada no combate, mas esconderia a auditoria de dados dentro do pipeline de dano.
- Adicionar vulnerabilidade agora: mostraria mais uma regra oficial, mas exigiria rolar `+1d6` com auditoria e aumentaria o escopo da fase.
- Aplicar dano recebido real imediatamente: daria retorno visual maior, mas exigiria decidir HP do personagem em combate, salvamento e regra oficial de ataque inimigo completo.
