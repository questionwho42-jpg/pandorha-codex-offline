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

Na T94-T96, quando o alvo de treino acerta um personagem da sessao, o app tambem calcula um dano de treino simples e reduz um medidor chamado `HP de treino`.

Esse medidor comeca no HP maximo derivado da ficha, mas vive apenas dentro do encontro atual. Ele pode chegar a 0 para mostrar que o fluxo funcionou, mas isso nao machuca a ficha real, nao salva dano, nao aplica Moribundo e nao coloca o personagem Inconsciente.

Na T97, chegar a 0 no `HP de treino` virou um encerramento local claro. A tela mostra `Teste recebido encerrado` e pede `Reiniciar encontro` antes de calcular outro dano recebido de treino.

Isso impede que o mesmo teste continue empilhando ataques recebidos depois que o medidor local ja zerou. Mesmo assim, ainda nao e dano real: nada muda no save, na ficha, em Moribundo, em Inconsciente ou em durabilidade.

Na T99, o modulo ganhou um contrato tecnico para registrar um evento de dano real recebido. Esse evento diz quem causou o dano, quem recebeu, quanto dano final foi resolvido e quando isso aconteceu.

Esse contrato ainda nao muda o HP real. Ele apenas prepara o tipo de registro que um sistema futuro podera repetir para calcular o estado da ficha com seguranca. Se nao houver alvo, ledger, dano valido ou se o alvo ja estiver em estado terminal, o contrato falha de forma tipada.

Na T101, o modulo ganhou essa repeticao segura dos eventos. Ele olha para a lista de eventos `realDamageReceived`, pega apenas os eventos do personagem certo e calcula quanto HP real sobraria.

Mesmo assim, ainda e uma conta local: nao salva a ficha, nao muda banco, nao aplica Moribundo, nao aplica Inconsciente e nao mexe em durabilidade. Se a lista tentar colocar outro dano depois que o HP ja chegou a 0, o replay bloqueia para evitar uma historia de combate incoerente.

Na T102, o modulo passou a juntar as duas partes: primeiro calcula o HP real atual pela lista de eventos, depois registra um novo evento de dano real e calcula o HP de novo.

Essa ponte ainda nao aparece na tela e ainda nao salva nada. Ela existe para garantir que qualquer futura previa visual use o mesmo caminho auditavel: evento primeiro, HP calculado depois.

Na T103, a frase que pode aparecer na tela foi preparada antes da tela existir. Ela sempre chama o resultado de `Previa local de HP real` e avisa que isso nao salva a ficha nem aplica Moribundo ou Inconsciente.

Isso evita que a interface prometa dano persistido antes de existir save, banco ou estado oficial de 0 HP.

Na T104, essa previa local passou a aparecer na aba Combate para personagens criados na sessao. Quando o alvo de treino acerta e causa dano de treino, a tela tambem mostra uma conta separada de como ficaria o HP real se os eventos locais fossem repetidos.

Essa previa ainda nao e o HP salvo da ficha. Trocar atacante, trocar alvo, trocar equipamento ou reiniciar o encontro limpa a previa local.

Na integracao de 2026-06-16, a aba Combate deixou de ter seletores proprios de
arma, escudo e armadura. Agora ela le o que o personagem equipou no Inventario.
Se nao houver arma equipada, o botao de ataque fica bloqueado e a tela oferece
abrir o Inventario.

Na integracao de 2026-06-17, a aba Combate tambem mostra o Cinto de Pocoes do
personagem. O botao de usar pocao diminui a quantidade carregada no Inventario,
mas a frase no log deixa claro que foi apenas treino: nao cura, nao muda HP real
e nao muda HP de treino.

## Alternativas

- Calcular tudo direto no botão da interface: seria mais rápido, mas misturaria UI e regra de combate.
- Criar primeiro um serviço puro: é o caminho atual, porque permite testar combate antes de colocar a tela no navegador.
- Criar combate completo com turno, iniciativa e grid agora: seria mais próximo do jogo final, mas teria risco alto demais para uma única tarefa.
- Salvar a arma equipada agora: mais conveniente, mas exigiria decisao de save version antes de o fluxo visual provar o contrato.
- Fazer o servico de dano rolar o dado internamente: reduziria uma chamada no combate, mas esconderia a auditoria de dados dentro do pipeline de dano.
- Adicionar vulnerabilidade agora: mostraria mais uma regra oficial, mas exigiria rolar `+1d6` com auditoria e aumentaria o escopo da fase.
- Aplicar dano recebido real imediatamente: daria retorno visual maior, mas exigiria decidir HP do personagem em combate, salvamento e regra oficial de ataque inimigo completo.
- Usar `HP de treino` local primeiro: e menos definitivo, mas permite testar o fluxo completo de dano recebido sem arriscar save, morte ou regras oficiais ainda nao fechadas.
- Permitir dano recebido repetido depois de 0 HP de treino: seria simples, mas confundiria o usuario e pareceria dano real; por isso a T97 exige reset local.
- Registrar primeiro um evento de dano real sem alterar HP: cria uma ponte segura para replay futuro, mas ainda nao entrega mudanca visual ao jogador.
- Repetir eventos para calcular HP real antes de salvar qualquer coisa: deixa a regra auditavel, mas ainda precisa de uma ponte e uma copy segura antes de aparecer na interface.
- Juntar evento e replay em uma funcao pura: facilita ligar uma futura UI sem inventar regra no componente, mas ainda nao resolve persistencia nem estados oficiais.
- Preparar a copy em um view model: reduz risco visual, mas ainda exige validacao renderizada no navegador antes de entregar para usuario.
- Mostrar a previa local na tela: da feedback visual, mas continua propositalmente separada do `HP de treino` e do save real.
- Ler o loadout persistido do Inventario: evita duas fontes de verdade para
  equipamento ativo, mas exige que o usuario ajuste arma e defesa fora da aba
  Combate.
- Usar o cinto como acesso rapido sem cura: entrega o caminho visivel no
  navegador com menos risco, mas deixa efeitos reais de item para um contrato
  futuro.
## 2026-06-18 - Item Quebrado No Combate

O Combate agora respeita quando o Inventario diz que um equipamento esta
quebrado. Se a arma, escudo ou armadura equipada estiver quebrada, o treino
orienta o usuario a voltar ao Inventario e reparar ou trocar o item.

Item danificado ainda nao muda ataque, defesa ou dano. O sistema apenas mostra a
condicao e bloqueia o que esta quebrado.
