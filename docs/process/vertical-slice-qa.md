# QA Da Vertical Slice Do MVP

## Baseline Pos-T80

Este roteiro agora representa o baseline local pos-T80 atualizado: a vertical social cobre save/load v9, inventário editável, loadout equipado persistido, durabilidade manual, negociação social, eventos sociais, clocks de retaliação por gatilho explícito, relação individual por NPC e leitura agrupada por facção. Enquanto a branch atual não estiver em `main`, promoções para `docs/changelog.md` devem permanecer como candidatas documentadas em `docs/process/t81-post-t80-handoff-baseline.md`.

Este roteiro valida o MVP navegavel atual do Pandorha Engine depois da T80. Ele nao substitui `quality:gate`; ele descreve o caminho humano que deve ser repetido antes de expandir dialogo literario completo ou consequencias narrativas mais profundas.

## Fluxo Principal No Navegador

1. Abra `http://127.0.0.1:5173/`.
2. Confirme que o cabeçalho mostra `Offline disponível neste navegador.`.
3. Abra `http://127.0.0.1:5173/manifest.webmanifest`, confirme que responde sem 404 e volte ao app.
4. Quando o navegador liberar o prompt, confirme `Instalar app`; quando houver worker aguardando, confirme `Atualizacao disponivel` e acione `Atualizar agora`.
5. Entre em `Personagens`, crie um personagem válido e confirme que ele aparece na lista com os 3 traços escolhidos e mensagem de kit inicial concedido.
6. Entre em `Compêndio`, busque `Vanguarda`, `contramagia` e `descanso`, confirme ranking textual previsível, filtre por `Magia`, `Combate` e `Sobrevivência`, navegue entre páginas quando houver paginação, busque um termo inexistente, clique em `Limpar busca e filtros`, selecione uma entrada e confirme fonte com arquivo e linha.
4. Clique em `Salvar sessão`, recarregue a página, clique em `Carregar save` e confirme que o personagem voltou.
5. Entre em `Inventário`, selecione o personagem, confirme o kit inicial já carregado, carregue arma, escudo, armadura e `Cinto de Poções` até `5/5`; carregue outros consumíveis até criar mais de uma pilha; confirme slots usados, limite e penalidade atual.
6. Equipe arma, escudo e armadura, substitua a arma no mesmo slot, use `Marcar danificado`, `Marcar quebrado` e `Reparar`, confirme que item quebrado nao equipa, confirme que remover item equipado mostra `Desequipe antes de remover`, desequipe e remova o item.
7. Incremente, consuma e remova consumíveis; salve a sessão, recarregue realmente a página, carregue o save e confirme que o inventário e o loadout equipado do personagem foram restaurados.
8. Entre em `Combate`, selecione o personagem como atacante, confirme `Loadout do Inventário` com arma/escudo/armadura restaurados, confirme `Cinto de poções: 5/5`, use uma poção do cinto, confirme `Poção do cinto usada em treino. HP real não foi alterado.`, confirme `4/5`, ataque um alvo de treino e confirme log, dano, HP e ações.
9. Entre em `Exploração`, mova para um hex adjacente e confirme log em pt-BR sem mudança de URL.
10. Entre em `Acampamento`, atribua ações, resolva a hora 1, confirme perigo/relógio/log, clique em `Preparar próxima hora`, confirme a hora 2 com ações padrão e resolva novamente.
11. Entre em `Relações`, invoque `Favor Tier 1`, confirme `Dívida 1/3` e `Intriga 1`.
12. Na mesma aba, selecione `Corretora de Treino`, clique em `Iniciar negociação`, confirme `Fala do NPC`, escolha a opção de diálogo `Barganhar`, confirme a resposta sobre a `troca proposta`, confirme `Modificador do argumento: +1`, clique em `Fazer apelo` e confirme `Bônus 1`, `HP mental 5/8`, `Persuasão 1/3` e log citando `Opção de diálogo escolhida: Barganhar`.
13. Selecione `Informante de Treino`, clique em `Reiniciar negociação`, confirme `HP mental 6/6`, confirme a fala sobre exigir uma garantia e confirme que `Pressionar` aparece bloqueado com `Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.`.
14. Ainda com o `Informante de Treino`, escolha `Barganhar`, confirme a resposta sobre a troca protegê-lo depois da conversa, confirme `Modificador do argumento: +1`, clique em `Fazer apelo` e confirme log citando `Opção de diálogo escolhida: Barganhar`.
15. Selecione `Capitão de Treino`, clique em `Reiniciar negociação`, confirme que a fala cita `moral da tropa`, confirme que `Barganhar` está disponível com `Fama 1` e escolha `Barganhar` para ver a resposta sobre `custo da escolta`.
16. Repita o apelo até encerrar a negociação e confirme que a consequência aparece em `WorldState` citando a escolha de diálogo usada.
17. Para validar T63-T70, reinicie a negociação com a `Corretora de Treino`, escolha `Pressionar`, faça apelos até encerrar a conversa e confirme consequência com `perda de 1 nível de Fama` e `Fama` reduzida na `Liga Mercante de Treino`.
18. Repita `Pressionar` quando a `Fama` da facção já estiver em 0 e confirme que a consequência cita `Infâmia`, que `Relações` mostra `Retaliação: Liga Mercante de Treino - 1/4 fatias` e que `Relações por NPC` mostra a `Corretora de Treino` tensionada dentro do grupo `Liga Mercante de Treino`.
19. Clique em `Salvar sessão`, recarregue, clique em `Carregar save` e confirme que relações, negociação social, log com argumento, opção bloqueada, consequência, `Fama`, `Infâmia`, relação individual por NPC e clock de retaliação foram restaurados.

## Automação Da T66

Use:

```powershell
npm.cmd run qa:next-phase-readiness
```

Esse comando executa `scripts/next_phase_readiness.mjs`. Ele valida que a entrega local está limpa para próxima fase: Git sem mudanças rastreadas, apenas `output/` como evidência local não rastreada, task ledger sem tarefa aberta, scripts obrigatórios registrados e smoke de seeds presente. Ele é um gate de fechamento e não entra no `quality:gate`, porque deve falhar enquanto uma tarefa ainda está em progresso.

## Automação Da T61

Use:

```powershell
npm.cmd run qa:vertical-slice
```

Esse comando executa `scripts/vertical_slice_smoke.mjs`. Ele valida contratos mínimos:

- abas principais registradas na navegação state-driven;
- componentes centrais montados em `App.svelte`;
- Compêndio com filtro de categoria, busca por `Vanguarda`, `contramagia` e `descanso`, ranking textual determinístico, paginação, estado vazio com limpeza de filtros, categorias `Sistema: Magia`, `Sistema: Combate` e `Sistema: Sobrevivência`, e fonte por arquivo e linha;
- guias de usuário com URL local;
- painel de negociação social e guia `docs/user/social-encounter.md`;
- seletor de `Argumento`, árvore curta de diálogo, opção `Barganhar` e log com escolha social;
- catálogo `training-informant` com opção `Pressionar` bloqueada por `minimumMentalHp` 7;
- catálogo `training-captain` com opção `Pressionar` bloqueável por `minimumMentalHp` 8, `Barganhar` exigindo `minimumFactionFame` 1 e copy oficial curta sobre moral da tropa e custo da escolta;
- contrato `DIALOGUE_OPTION_BLOCKED` e cópia pt-BR de bloqueio exibida para o usuário;
- contrato de consequência social com `dialogueOptionId`, `dialogueChoiceId`, `dialogueChoiceLabel` e resumo específico por escolha;
- contrato T63-T76 de `Pressionar` com flag `social-pressure-fame-penalty`, perda de 1 nível de `Fama`, ganho de `Infâmia` quando a Fama já está em 0, relação individual por NPC e clock de retaliação salvo/avançado em `clocks`;
- save/load v9 com `socialEncounters`, `socialEncounterEvents`, `npcRelationships`, `inventoryEvents`, `equipmentLoadoutEvents` e `equipmentDurabilityEvents`;
- cinto de poções consome 1 unidade pelo inventário persistido sem alterar HP real;
- service worker presente com eventos básicos de PWA e runtime cacheado com fallback.

O script é um smoke estático/contratual, não substitui o Browser do Codex. Ele existe para falhar cedo quando uma aba, guia ou peça central do MVP desaparecer sem intenção.

## Automação De Alcance Da UI

Use:

```powershell
npm.cmd run qa:ui-reachability
```

Esse comando executa `scripts/ui_reachability_smoke.mjs`. Ele protege o alcance das nove abas, as ações editáveis do inventário, a persistência do ledger no save atual, o acesso ao cinto de poções no combate de treino, o favicon estático sem request 404, bloqueia placeholders obsoletos e verifica o contrato que preserva o log recém-resolvido do Acampamento até o comando explícito de preparar a próxima hora.

Para o Compêndio, ele também exige filtro de categoria, busca ampliada para entradas geradas, termos `Vanguarda`, `contramagia` e `descanso`, categorias de sistema, paginação, limpeza de filtros no estado vazio e fonte por arquivo e linha.

O smoke é contratual e não substitui a validação renderizada. Mudanças visuais ou de navegação continuam exigindo o Browser do Codex para abrir todas as abas, executar os fluxos afetados e confirmar ausência de erros no console.

Última validação renderizada desta superfície: 2026-06-19, com Browser do Codex/Playwright e Chrome local. O fluxo abriu as nove abas, criou personagem com kit inicial, marcou arma como `Danificado`, `Quebrado` e `Íntegro`, confirmou bloqueio de item quebrado no Inventário e no Combate, salvou, recarregou de verdade e carregou o save v9 restaurando personagem, inventário, loadout, durabilidade, Acampamento e negociação sem erros de console.

## Automação Da T62

Use:

```powershell
npm.cmd run qa:social-browser-smoke
```

Esse comando executa `scripts/social_browser_smoke.mjs`. Ele valida o contrato recorrente do roteiro de navegador social sem instalar dependência nova: controles de save/load na aba `Relações`, seletores e botões com `data-testid`, consequência em `WorldState` com metadados de `Barganhar`, penalidade T63-T76 para `Pressionar`, save v9 com eventos de negociação, `npcRelationships`, `inventoryEvents`, `equipmentLoadoutEvents`, `equipmentDurabilityEvents` e guia em ordem `Barganhar -> Fazer apelo -> WorldState -> Salvar sessão -> recarregue -> Carregar save`.

O smoke T62 continua sendo contratual/headless. Mudanças visuais em `.svelte` ainda exigem o Browser do Codex para confirmar o fluxo renderizado.

## Avaliação Da T84

Use `docs/process/t84-social-rendered-browser-automation-evaluation.md` como decisão atual sobre automação renderizada social.

Por enquanto, não há dependência Playwright no repositório. `qa:social-browser-smoke` continua sendo um smoke contratual/headless, e o Browser do Codex continua obrigatório quando uma mudança visual em `.svelte` altera a aba `Relações`.

Reabra a decisão apenas se o fluxo renderizado ficar repetitivo o suficiente para compensar dependência nova, dev server dedicado, porta estável e tratamento de flake.

## Automação Da T65

Use:

```powershell
npm.cmd run qa:dialogue-seeds
```

Esse comando executa `scripts/dialogue_seed_smoke.mjs`. Ele valida o contrato recorrente das árvores sociais curtas: cada NPC de treino precisa ter 4 nós, 3 opções, uma abertura, escolhas `Persuadir`, `Barganhar` e `Pressionar` em ordem estável, ponteiros válidos, `sourceFile` coerente com o NPC e `blockedReason` para opções bloqueadas por HP mental, WorldState ou Fama.

O smoke T65 é estático e não substitui o Browser do Codex quando uma mudança visual em `.svelte` altera a aba `Relações`.

## O Que Funciona Hoje

- Criação e listagem de personagens básicos com 3 traços persistidos e kit inicial concedido pelo ledger de inventário.
- Compêndio com entradas curadas e índice estático gerado para sobrevivência, combate e magia, busca textual ranqueada, filtro de categoria, paginação, estado vazio acionável e fonte por arquivo e linha.
- Save/load local real com SQLite WASM, OPFS e Worker.
- Combate de treino com atacante da sessão, loadout persistido do inventário para arma/escudo/armadura, alvos fixos, turno, ações, rolagem auditável de arma, RD/afinidades de alvo, ataque passivo do alvo contra CA de treino, HP de treino local não persistido, estado `Teste recebido encerrado` em 0 HP de treino e derrota do alvo.
- O inventário editável pertence ao personagem, permite equipar/desequipar arma, escudo e armadura, recebe o kit inicial de personagens novos, bloqueia remoção de item equipado, registra durabilidade manual e persiste inventário + loadout + durabilidade no save v9.
- Cinto de poções de treino: o combate exibe a pilha `potion-belt-stack`, consome 1 unidade pelo ledger de inventário existente e registra que HP real não foi alterado.
- Magia mínima que prepara comando sem executar efeito.
- Exploração hexcrawl mínima com mapa de 7 hexes.
- Acampamento com horas manuais encadeadas, perigo acumulado e relógio coletivo, ainda sem noite automática.
- Relações sociais de treino com dívida, intriga e save/load.
- NPCs de treino, negociação social, HP mental, paciência, trilha de persuasão, relação individual por NPC e save/load v9.
- Escolhas de argumento social (`Persuadir`, `Barganhar`, `Pressionar`) com modificador visível, árvores curtas de diálogo para a `Corretora de Treino`, o `Informante de Treino` e o `Capitão de Treino`, log persistido e consequência em `WorldState` com a última escolha de diálogo usada.
- `Pressionar` em negociação terminal aplica perda idempotente de 1 nível de `Fama` na facção do NPC; se a Fama já estiver em 0, aplica 1 nível de `Infâmia` e registra pressão na relação individual do NPC.
- Pressão social que gera `Infâmia` ou `ultimatum` cria um clock ativo de retaliação salvo em `clocks` e o avança por gatilho explícito `social-pressure`.
- Opções de diálogo bloqueáveis por HP mental, WorldState e Fama: `Pressionar` exige HP mental 6 na corretora, HP mental 7 no informante e HP mental 8 no capitão; `Barganhar` com o capitão exige Fama 1.
- Smoke PWA com status offline disponível.
- Service worker com runtime network-first e fallback em cache para evitar assets obsoletos durante desenvolvimento.

## Limitações Conhecidas

- O modo offline ainda não tem automação de rede confiável dentro do Browser do Codex atual.
- O índice do Compêndio é metadado de descoberta; ele não interpreta mecânicas, não resume regras por IA, não altera `docs/system/` e não faz parsing de Markdown em runtime.
- As árvores de diálogo ainda são curtas, cobrem apenas a `Corretora de Treino`, o `Informante de Treino` e o `Capitão de Treino`, e preparam o argumento antes do apelo social.
- `Pressionar` altera a relação individual por NPC e avança clocks de retaliação apenas por gatilho explícito `social-pressure`; não há avanço automático por tempo.
- Magia e exploração ainda usam dados de treino; combate ainda usa alvos de treino e HP de treino local, mas deriva arma/escudo/armadura do loadout persistido, bloqueia item quebrado e usa cinto de poções do inventário persistido.
- O ataque do alvo de treino contra personagens da sessão calcula dano e reduz apenas `HP de treino` local; ao chegar a 0, exige `Reiniciar encontro` para outro dano recebido e não altera HP real, dano persistente, save, durabilidade, Moribundo, Inconsciente ou monstros oficiais.
- Usar `Cinto de poções` no combate não cura, não altera HP real, não altera HP de treino, não aplica estados oficiais e não define economia de ação oficial.
- O save usa um único slot local `primary`.
- Não há autosave, cloud sync, push, atualização avançada de cache ou PWA instalável com ícones.

## Gates Obrigatórios

Antes de iniciar a próxima fase, rode:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run test:coverage
npm.cmd run build
npm.cmd run quality:gate
npm.cmd run qa:vertical-slice
npm.cmd run qa:social-browser-smoke
npm.cmd run qa:dialogue-seeds
npm.cmd run qa:next-phase-readiness
```

Quando houver UI alterada, valide também no Browser do Codex com o fluxo principal acima.
