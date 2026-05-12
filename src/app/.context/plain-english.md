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
