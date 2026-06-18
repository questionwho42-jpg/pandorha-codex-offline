# App Em Linguagem Simples

Este modulo cria a primeira tela que abre no navegador. Ele ainda nao tem regras de jogo, personagens ou banco de dados.

A alternativa seria criar varias telas de uma vez, mas isso aumentaria o risco de erro. A escolha atual cria apenas a base para testar se o app carrega.

Agora ele tambem permite trocar entre Inicio, Personagens e Compendio sem recarregar a pagina. Essas telas ainda sao avisos temporarios para mostrar onde as proximas features vao aparecer.

Na T04, a tela recebeu a primeira identidade visual oficial: fundo escuro, painel de ruina, texto claro e destaque dourado. Ela continua sem regras de jogo, sem personagens reais e sem banco de dados; a mudanca serve para o usuario reconhecer o formato visual basico do app no navegador.

Na T22B, o app ganhou a aba Combate. Ela mostra um encontro fixo de treino em que Aria pode atacar um Guarda de Treino e o usuario ve HP, CA, dano e log. Esse combate ainda nao salva nada e reinicia se a pagina for recarregada.

Na T22C, a aba Combate ganhou um seletor de alvo. O usuario pode trocar entre tres alvos de treino; ao trocar, o HP e o log reiniciam para testar outro alvo sem recarregar a pagina.

Na T22D, a aba Combate tambem pode usar personagens criados na sessao como atacante. O personagem aparece no seletor e no log do ataque, mas ainda nao usa ficha completa, equipamento ou HP real.

Na T22E, a aba Combate mostra rodada, turno ativo e acoes restantes. Atacar gasta uma acao, e o botao Encerrar turno alterna entre o atacante e o alvo de treino.

Na T22F, a aba Combate tambem mostra HP maximo, iniciativa e carga quando o atacante selecionado e um personagem criado na sessao. Esses dados ajudam o usuario a reconhecer a ficha, mas ainda nao mudam o ataque ou o dano do treino.

Na T22G, um personagem criado na sessao com Fisico maior passa a causar mais dano no ataque de treino. Aria ainda usa valores fixos, e o sistema ainda nao usa arma ou equipamento real.

Na T22H, o turno do alvo ficou mais claro: quando o usuario encerra o turno do alvo de treino, o log informa que ele manteve posicao. Ele ainda nao age sozinho.

Na T22I, quando o alvo de treino chega a 0 HP, a aba Combate mostra um aviso de alvo derrotado. Depois disso, atacar e encerrar turno ficam bloqueados, mas o usuario ainda pode reiniciar o encontro.

Na T25, o app ganhou a aba Inventario. Ela mostra uma lista fixa de itens, quantos slots eles ocupam, o limite de carga e se o personagem de treino esta Normal, Lento ou Imobilizado. Ainda nao da para editar itens, salvar inventario ou usar equipamento no combate.

Na T28, o app ganhou a aba Magia. Ela deixa o usuario escolher uma magia, ver custo, componentes, fonte e alvo de treino, e preparar um comando de conjuracao. A magia ainda nao e executada: nada gasta EE, nada causa dano e nada muda no combate.

Na T31, o app ganhou a aba Exploracao. Ela mostra um mapa pequeno com sete hexagonos: o usuario pode clicar em um hex vizinho, ver a posicao mudar e acompanhar o log. O mapa ainda nao salva progresso, nao rola Navegacao e nao cria encontros reais.

Na T33D, a aba Personagens ganhou os botoes Salvar sessao e Carregar save. O usuario pode criar um personagem, salvar, recarregar a pagina e carregar o personagem de volta usando o armazenamento local real do navegador. Ainda existe apenas um slot de save e os fatos do mundo sao guardados sem tela propria.

Na T35D, o app ganhou a aba Acampamento. O usuario pode escolher uma acao para cada personagem, resolver 1 hora, ver o perigo subir, acompanhar o relogio Fortificar perimetro e salvar esse estado no navegador.

Na T39, o app ganhou o primeiro suporte offline. Depois de carregar o jogo uma vez, o navegador prepara uma copia local basica para tentar abrir a interface mesmo sem conexao. Isso ainda nao e um modo offline completo com atualizacao sofisticada; e um teste inicial para provar que o app consegue sobreviver a um recarregamento offline.

Na T47, a aba Relacoes passou a usar personagens criados na sessao como negociadores. O usuario escolhe o personagem, inicia uma negociacao, faz um apelo e ve a rolagem social usada para alterar HP mental, paciencia e progresso.

Na T49, quando uma negociacao termina, o app registra uma consequencia no estado do mundo. Essa consequencia aparece na aba Relacoes e tambem volta depois que o usuario salva, recarrega a pagina e carrega o save.

Na T51, a aba Relacoes ganhou escolhas de argumento. Antes de fazer o apelo, o usuario pode escolher Persuadir, Barganhar ou Pressionar; a tela mostra o modificador e a rolagem passa a usar esse bonus.

Na T73-T76, o app passou a guardar relacoes individuais com NPCs no save. Quando o usuario usa Pressionar numa negociacao, o app atualiza Fama/Infamia, registra a pressao na relacao daquele NPC, avanca o clock de retaliacao por um gatilho explicito e mostra o resumo em Relacoes por NPC.

Na T92, a aba Combate passou a receber tambem o servico que deixa o alvo de treino atacar um personagem criado na sessao. O app apenas entrega esse servico para o painel; quem calcula a CA e resolve o ataque continua sendo a feature de combate.

Esse ataque recebido ainda e de treino: ele aparece no log, usa a CA equipada do personagem e nao mexe no HP real nem no save.

As descricoes da navegacao agora falam sobre o que ja esta disponivel no navegador. Uma verificacao automatica impede que avisos antigos de "sera implementado" voltem depois que uma tela ja existe.

O Inventario agora pertence ao personagem selecionado. O usuario pode carregar,
equipar, desequipar, consumir e remover itens, salvar a sessao e recuperar o
mesmo inventario e o equipamento ativo depois de recarregar a pagina.

O Combate agora olha para esse equipamento ativo do Inventario. Se o personagem
equipou uma espada, escudo e armadura no Inventario, a aba Combate usa esses
itens para mostrar arma ativa, dano de treino e defesa equipada. Se nao houver
arma equipada, a tela manda o usuario abrir o Inventario em vez de escolher uma
arma local no proprio combate.

O Combate tambem consegue olhar para o `Cinto de Pocoes` carregado no
Inventario. Quando o usuario usa uma pocao do cinto, o app consome 1 unidade do
inventario e registra no log que isso foi apenas treino: HP real e HP de treino
nao mudam.

Quando o usuario cria um personagem, o app agora tambem guarda os tres tracos de
ancestralidade escolhidos. Eles entram no save v8 e podem voltar depois de
salvar, recarregar a pagina e carregar o save.

Esses tracos ainda nao aplicam efeitos automaticos. Por enquanto o app apenas
lembra a escolha da ficha; bonus, passivas e equipamento inicial continuam para
etapas futuras.

A lista de personagens agora mostra esses tres tracos salvos. Assim o usuario
consegue conferir a ficha depois de criar, salvar, recarregar e carregar o save.
