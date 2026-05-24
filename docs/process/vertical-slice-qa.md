# QA Da Vertical Slice Do MVP

Este roteiro valida o MVP navegável atual do Pandorha Engine depois da T57. Ele não substitui `quality:gate`; ele descreve o caminho humano que deve ser repetido antes de expandir NPCs oficiais, diálogo literário completo ou consequências narrativas mais profundas.

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
10. Repita o apelo até encerrar a negociação e confirme que a consequência aparece em `WorldState`.
11. Clique em `Salvar sessão`, recarregue, clique em `Carregar save` e confirme que relações, negociação social, log com argumento e consequência foram restaurados.

## Automação Da T45

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
- save/load v4 com `socialEncounters` e `socialEncounterEvents`;
- service worker presente com eventos básicos de PWA e runtime cacheado com fallback.

O script é um smoke estático/contratual, não substitui o Browser Use. Ele existe para falhar cedo quando uma aba, guia ou peça central do MVP desaparecer sem intenção.

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
- Escolhas de argumento social (`Persuadir`, `Barganhar`, `Pressionar`) com modificador visível, árvore curta de diálogo para a `Corretora de Treino`, log persistido e consequência em `WorldState`.
- Smoke PWA com status offline disponível.
- Service worker com runtime network-first e fallback em cache para evitar assets obsoletos durante desenvolvimento.

## Limitações Conhecidas

- O modo offline ainda não tem automação de rede confiável dentro do Browser Use atual.
- A árvore de diálogo ainda é curta, cobre apenas a `Corretora de Treino` e prepara o argumento antes do apelo social.
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
```

Quando houver UI alterada, valide também no Browser Use com o fluxo principal acima.
