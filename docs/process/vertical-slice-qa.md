# QA Da Vertical Slice Do MVP

Este roteiro valida o MVP navegável atual do Pandorha Engine depois da T61. Ele não substitui `quality:gate`; ele descreve o caminho humano que deve ser repetido antes de expandir NPCs oficiais, diálogo literário completo ou consequências narrativas mais profundas.

## Fluxo Principal No Navegador

1. Abra `http://127.0.0.1:5173/`.
2. Confirme que o cabeçalho mostra `Offline disponível neste navegador.`.
3. Entre em `Personagens`, crie um personagem válido e confirme que ele aparece na lista.
4. Clique em `Salvar sessão`, recarregue a página, clique em `Carregar save` e confirme que o personagem voltou.
5. Entre em `Combate`, selecione o personagem como atacante, ataque um alvo de treino e confirme log, dano, HP e ações.
6. Entre em `Exploração`, mova para um hex adjacente e confirme log em pt-BR sem mudança de URL.
7. Entre em `Acampamento`, atribua ações para personagens, resolva 1 hora e confirme perigo, relógio e log.
8. Entre em `Relações`, invoque `Favor Tier 1`, confirme `Dívida 1/3` e `Intriga 1`.
9. Na mesma aba, selecione `Corretora de Treino`, clique em `Iniciar negociação`, confirme `Fala do NPC`, escolha a opção de diálogo `Barganhar`, confirme a resposta sobre a `troca proposta`, confirme `Modificador do argumento: +1`, clique em `Fazer apelo` e confirme `Bônus 1`, `HP mental 5/8`, `Persuasão 1/3` e log citando `Opção de diálogo escolhida: Barganhar`.
10. Selecione `Informante de Treino`, clique em `Reiniciar negociação`, confirme `HP mental 6/6`, confirme a fala sobre exigir uma garantia e confirme que `Pressionar` aparece bloqueado com `Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.`.
11. Ainda com o `Informante de Treino`, escolha `Barganhar`, confirme a resposta sobre a troca protegê-lo depois da conversa, confirme `Modificador do argumento: +1`, clique em `Fazer apelo` e confirme log citando `Opção de diálogo escolhida: Barganhar`.
12. Repita o apelo até encerrar a negociação e confirme que a consequência aparece em `WorldState` citando a escolha de diálogo usada.
13. Clique em `Salvar sessão`, recarregue, clique em `Carregar save` e confirme que relações, negociação social, log com argumento, opção bloqueada e consequência com a escolha de diálogo foram restaurados.

## Automação Da T61

Use:

```powershell
npm.cmd run qa:vertical-slice
```

Esse comando executa `scripts/vertical_slice_smoke.mjs`. Ele valida contratos mínimos:

- abas principais registradas na navegação state-driven;
- componentes centrais montados em `App.svelte`;
- guias de usuário com URL local;
- painel de negociação social e guia `docs/user/social-encounter.md`;
- seletor de `Argumento`, árvore curta de diálogo, opção `Barganhar` e log com escolha social;
- catálogo `training-informant` com opção `Pressionar` bloqueada por `minimumMentalHp` 7;
- contrato `DIALOGUE_OPTION_BLOCKED` e cópia pt-BR de bloqueio exibida para o usuário;
- contrato de consequência social com `dialogueOptionId`, `dialogueChoiceId`, `dialogueChoiceLabel` e resumo específico por escolha;
- save/load v4 com `socialEncounters` e `socialEncounterEvents`;
- service worker presente com eventos básicos de PWA e runtime cacheado com fallback.

O script é um smoke estático/contratual, não substitui o Browser Use. Ele existe para falhar cedo quando uma aba, guia ou peça central do MVP desaparecer sem intenção.

## Automação Da T62

Use:

```powershell
npm.cmd run qa:social-browser-smoke
```

Esse comando executa `scripts/social_browser_smoke.mjs`. Ele valida o contrato recorrente do roteiro de navegador social sem instalar dependência nova: controles de save/load na aba `Relações`, seletores e botões com `data-testid`, consequência em `WorldState` com metadados de `Barganhar`, save v4 com eventos de negociação e guia em ordem `Barganhar -> Fazer apelo -> WorldState -> Salvar sessão -> recarregue -> Carregar save`.

O smoke T62 continua sendo contratual/headless. Mudanças visuais em `.svelte` ainda exigem Browser Use ou Playwright CLI para confirmar o fluxo renderizado.

## O Que Funciona Hoje

- Criação e listagem de personagens básicos.
- Save/load local real com SQLite WASM, OPFS e Worker.
- Combate de treino com atacante da sessão, alvos fixos, turno, ações, dano e derrota.
- Inventário read-only com carga de treino.
- Magia mínima que prepara comando sem executar efeito.
- Exploração hexcrawl mínima com mapa de 7 hexes.
- Acampamento de 1 hora com perigo e relógio coletivo.
- Relações sociais de treino com dívida, intriga e save/load.
- NPCs de treino, negociação social, HP mental, paciência, trilha de persuasão e save/load v4.
- Escolhas de argumento social (`Persuadir`, `Barganhar`, `Pressionar`) com modificador visível, árvores curtas de diálogo para a `Corretora de Treino` e o `Informante de Treino`, log persistido e consequência em `WorldState` com a última escolha de diálogo usada.
- Opções de diálogo bloqueáveis por HP mental: `Pressionar` exige HP mental 6 na corretora e HP mental 7 no informante, sem criar migration ou save v5.
- Smoke PWA com status offline disponível.
- Service worker com runtime network-first e fallback em cache para evitar assets obsoletos durante desenvolvimento.

## Limitações Conhecidas

- O modo offline ainda não tem automação de rede confiável dentro do Browser Use atual.
- As árvores de diálogo ainda são curtas, cobrem apenas a `Corretora de Treino` e o `Informante de Treino`, e preparam o argumento antes do apelo social.
- `Pressionar` ainda não piora relação por conta própria; nesta fase ele é apenas um modificador negativo.
- Inventário, magia, exploração e combate ainda usam dados de treino.
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
```

Quando houver UI alterada, valide também no Browser Use com o fluxo principal acima.
