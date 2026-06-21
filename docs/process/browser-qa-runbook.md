# Runbook Deterministico Do Browser

Este runbook transforma o roteiro humano atual em checklist repetivel para o Browser do Codex. Ele nao substitui validacao renderizada; ele define a ordem minima que deve ser executada quando a UI mudar.

## Nove abas

1. Inicio
2. Personagens
3. Compendio
4. Inventario
5. Exploracao
6. Acampamento
7. Relacoes
8. Magia
9. Combate

## Gates Antes Do Browser

- qa:ui-reachability: registrado
- npm.cmd run docs:audit

## Fluxos Visiveis Atuais

- Abra http://127.0.0.1:5173/.
- Confirme que o cabeçalho mostra Offline disponível neste navegador..
- Abra http://127.0.0.1:5173/manifest.webmanifest, confirme que responde sem 404 e volte ao app.
- Quando o navegador liberar o prompt, confirme Instalar app; quando houver worker aguardando, confirme Atualizacao disponivel e acione Atualizar agora.
- Entre em Personagens, crie um personagem válido e confirme que ele aparece na lista com os 3 traços escolhidos e mensagem de kit inicial concedido.
- Entre em Compêndio, busque Vanguarda, contramagia e descanso, filtre por Magia, Combate e Sobrevivência, selecione uma entrada e confirme fonte com arquivo e linha.
- Clique em Salvar sessão, recarregue a página, clique em Carregar save e confirme que o personagem voltou.
- Entre em Inventário, selecione o personagem, confirme o kit inicial já carregado, carregue arma, escudo, armadura e Cinto de Poções até 5/5; carregue outros consumíveis até criar mais de uma pilha; confirme slots usados, limite e penalidade atual.
- Equipe arma, escudo e armadura, substitua a arma no mesmo slot, use Marcar danificado, Marcar quebrado e Reparar, confirme que item quebrado nao equipa, confirme que remover item equipado mostra Desequipe antes de remover, desequipe e remova o item.
- Incremente, consuma e remova consumíveis; salve a sessão, recarregue realmente a página, carregue o save e confirme que o inventário e o loadout equipado do personagem foram restaurados.
- Entre em Combate, selecione o personagem como atacante, confirme Loadout do Inventário com arma/escudo/armadura restaurados, confirme Cinto de poções: 5/5, use uma poção do cinto, confirme Poção do cinto usada em treino. HP real não foi alterado., confirme 4/5, ataque um alvo de treino e confirme log, dano, HP e ações.
- Entre em Exploração, mova para um hex adjacente e confirme log em pt-BR sem mudança de URL.
- Entre em Acampamento, atribua ações para personagens, resolva 1 hora e confirme perigo, relógio e log.
- Entre em Relações, invoque Favor Tier 1, confirme Dívida 1/3 e Intriga 1.
- Na mesma aba, selecione Corretora de Treino, clique em Iniciar negociação, confirme Fala do NPC, escolha a opção de diálogo Barganhar, confirme a resposta sobre a troca proposta, confirme Modificador do argumento: +1, clique em Fazer apelo e confirme Bônus 1, HP mental 5/8, Persuasão 1/3 e log citando Opção de diálogo escolhida: Barganhar.
- Selecione Informante de Treino, clique em Reiniciar negociação, confirme HP mental 6/6, confirme a fala sobre exigir uma garantia e confirme que Pressionar aparece bloqueado com Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena..
- Ainda com o Informante de Treino, escolha Barganhar, confirme a resposta sobre a troca protegê-lo depois da conversa, confirme Modificador do argumento: +1, clique em Fazer apelo e confirme log citando Opção de diálogo escolhida: Barganhar.
- Selecione Capitão de Treino, clique em Reiniciar negociação, confirme que a fala cita moral da tropa, confirme que Barganhar está disponível com Fama 1 e escolha Barganhar para ver a resposta sobre custo da escolta.
- Repita o apelo até encerrar a negociação e confirme que a consequência aparece em WorldState citando a escolha de diálogo usada.
- Para validar T63-T70, reinicie a negociação com a Corretora de Treino, escolha Pressionar, faça apelos até encerrar a conversa e confirme consequência com perda de 1 nível de Fama e Fama reduzida na Liga Mercante de Treino.
- Repita Pressionar quando a Fama da facção já estiver em 0 e confirme que a consequência cita Infâmia, que Relações mostra Retaliação: Liga Mercante de Treino - 1/4 fatias e que Relações por NPC mostra a Corretora de Treino tensionada dentro do grupo Liga Mercante de Treino.
- Clique em Salvar sessão, recarregue, clique em Carregar save e confirme que relações, negociação social, log com argumento, opção bloqueada, consequência, Fama, Infâmia, relação individual por NPC e clock de retaliação foram restaurados.

## Save E Load

- Criar ou alterar dados visiveis.
- Acionar Salvar sessao.
- Recarregar a pagina de verdade.
- Acionar Carregar save.
- Confirmar que personagens, inventario, loadout, durabilidade, relacoes e clocks voltaram quando aplicavel.

## Inspecao de console

- Abrir o console do navegador antes do fluxo.
- Executar as nove abas sem erros ou warnings novos.
- Registrar qualquer erro com tela, acao e texto exato.

## Criterios De Aceite Por Tela

- Cada aba monta o painel esperado sem placeholder obsoleto.
- A copia visivel permanece em pt-BR.
- Save/load so e exigido nas telas que alteram estado persistido.
- Scripts apontam evidencias estruturais; regras de RPG continuam soberanas em docs/system.
