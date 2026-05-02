# Relatorio do Projeto Pandorha - 2026-05-01

Este documento foi criado para que outro modelo de IA consiga entender o estado atual do projeto, o que foi investigado nesta sessao e quais cuidados deve tomar antes de continuar.

## Resumo executivo

- O diretorio ativo da sessao e `C:\Users\Pichau\Desktop\pandorha sistema 28-04`.
- Esse diretorio nao e um repositorio Git e contem principalmente arquivos Markdown de regras, lore, cenarios e codices do sistema Pandorha.
- A implementacao Foundry VTT real foi localizada em `C:\Users\Pichau\Desktop\pandorha foundry`.
- O usuario apontou que a implementacao atual esta "muito simples", parecendo "uma pagina na web com templates extremamente simples", e que isso nao passa a sensacao de um jogo/sistema de RPG.
- A investigacao confirmou que o sistema Foundry tem dados, compendios, modelos e automacoes uteis, mas a interface principal ainda e muito baseada em formularios, paineis simples e listas repetidas.
- Nao foram encontrados commits nem arquivos com `LastWriteTime` em 2026-05-01 dentro de `pandorha foundry`.
- Antes deste documento, a sessao fez apenas exploracao nao destrutiva: leitura de arquivos, status Git, listagem de estrutura e diagnostico da UI.

## Diretorios e fontes de verdade

### `C:\Users\Pichau\Desktop\pandorha sistema 28-04`

Estado observado:

- Nao e repositorio Git.
- Contem os textos do sistema em `.md.md`, incluindo:
  - `Pandorha_Sistema_Compilado.md.md`
  - `Guia_Criacao_de_Ficha.md.md`
  - `Ficha_Expandida.md.md`
  - `00_Mecanicas_Fundamentais.md.md`
  - `03_Codex_de_Combate_e_Condicoes.md.md`
  - varios codices de magia, combate, exploracao, equipamentos, classes, talentos, monstros e cenarios.
- Deve ser tratado como fonte de regras/lore, nao como a implementacao Foundry.

### `C:\Users\Pichau\Desktop\pandorha foundry`

Estado observado:

- E o repositorio Git do sistema Foundry.
- Branch atual: `main`.
- Remote:
  - `origin https://github.com/questionwho42-jpg/sistema-pandorha-foundry.git`
- Ultimo commit encontrado:
  - `59fec96 2026-03-08 07:43:21 -0300 Fix initiative formula and bump version to 0.1.73`
- Nao houve commit desde `2026-05-01 00:00`.

Arquivos principais:

- `system.json`: manifesto do sistema Foundry.
- `module/pandorha.mjs`: ponto de entrada; registra documentos, sheets, helpers e quickbar.
- `module/applications/actor-sheet.mjs`: logica principal da ficha de ator.
- `module/applications/item-sheet.mjs`: logica da ficha de item.
- `templates/actor/actor.hbs`: template principal da ficha de ator.
- `templates/item/item.hbs`: template principal da ficha de item.
- `styles/pandorha-0.1.50.css`: CSS carregado de fato pelo `system.json`.
- `styles/pandorha.css`: CSS parecido/existente, mas nao e o arquivo carregado pelo manifesto no estado atual.
- `packs/*.db`: compendios Foundry em formato JSON por linha.

## Estado Git atual de `pandorha foundry`

Saida relevante de `git status --short`:

```text
 M packs/ancestries.db
 M packs/bestiary.db
 M packs/conditions.db
 M packs/maneuvers.db
 M packs/spells.db
?? import_assets/
?? nova_macro_rolagem.md
?? scripts/macros/
```

Resumo de `git diff --stat`:

```text
packs/ancestries.db |  12 +-
packs/bestiary.db   | 480 ++++++++++++++++++++++++++--------------------------
packs/conditions.db |  68 ++++----
packs/maneuvers.db  | 180 ++++++++++----------
packs/spells.db     | 220 ++++++++++++------------
5 files changed, 480 insertions(+), 480 deletions(-)
```

Interpretacao:

- Existem alteracoes nao commitadas em cinco compendios.
- O tamanho do diff sugere reserializacao/reformatacao de linhas JSON, mudancas de encoding ou mudancas em massa de conteudo. Nao assumir que e seguro commitar sem revisar.
- Como os arquivos de pack sao dados de jogo, qualquer proximo agente deve evitar reverter, formatar ou commitar esses packs sem pedido explicito.
- Os arquivos novos em `import_assets/`, `nova_macro_rolagem.md` e `scripts/macros/` tambem parecem ser trabalho anterior ainda nao rastreado.

Arquivos nao rastreados observados:

- `scripts/macros/universal_roller.js`
- `nova_macro_rolagem.md`
- `import_assets/assign_images.py`
- `import_assets/fvtt-Actor-monstro-(2)-NBhBUAYV4TliUTOC.json`
- `import_assets/bestiary/*.json`
- `import_assets/npcs/*.json`

## O que foi descoberto sobre o sistema Foundry

### Manifesto

`system.json`:

- `id`: `pandorha`
- `title`: `Pandorha`
- `version`: `0.1.73`
- Compatibilidade:
  - minimo Foundry `13`
  - verificado `13.351`
  - maximo `13`
- Carrega:
  - `module/pandorha.mjs`
  - `scripts/monks-tokenbar-integration.mjs`
  - `styles/pandorha-0.1.50.css`
- Iniciativa:
  - `1d20 + @derived.initiative`
- Registra tipos de `Actor`:
  - `character`
  - `npc`
  - `monster`
- Registra muitos tipos de `Item`:
  - `ancestry`, `trait`, `class`, `talent`, `maneuver`, `spell`, `weapon`, `armor`, `shield`, `equipment`, `consumable`, `condition`, `background`, `feature`, `ability`, `rune`, `disease`, `toxin`
- Registra packs de ancestralidades, tracos, classes, talentos, manobras, magias, equipamentos, condicoes, antecedentes, runas, doencas, toxinas, bestiario, habilidades de monstros e livro de regras.

### Entrada do sistema

`module/pandorha.mjs`:

- Define `CONFIG.Actor.documentClass = PandorhaActor`.
- Define `CONFIG.Item.documentClass = PandorhaItem`.
- Registra `PandorhaActorModel` para `character`, `npc` e `monster`.
- Registra `PandorhaItemModel` para os tipos de item do sistema.
- Registra `PandorhaActorSheet` como sheet padrao de atores.
- Registra `PandorhaItemSheet` como sheet padrao de itens.
- Registra helpers Handlebars.
- Cria settings de quickbar:
  - `enableQuickbar`
  - `quickbarExpanded`
- Atualiza quickbar em hooks de canvas, token, hotbar e actor.

### Modelo de ator

`module/documents/data/actor-model.mjs` define:

- `description`
- `details.biography`
- `details.notes`
- `details.ancestry`
- `details.class`
- `details.background`
- `details.crest`
- `details.portrait`
- `attributes.level`
- `attributes.xp`
- `attributes.tier`
- `eixos.fisico`, `eixos.mental`, `eixos.social`
- `aplicacoes.conflito`, `aplicacoes.interacao`, `aplicacoes.resistencia`
- `potencial`
- recursos:
  - `resources.hp.value/max/temp`
  - `resources.pv.value/max`
  - `resources.ee.value/max`
  - `resources.actions.value/max`
  - `resources.reaction.value/max`
- defesas:
  - `defenses.ca`
  - `defenses.caBase`
- movimento:
  - `movement.base/climb/swim/fly`
- treinamento:
  - `training.weapons`
  - `training.armors`
  - `training.skills`
- bonus:
  - `bonuses.attack`
  - `bonuses.damage`
- pericias:
  - `furtividade_fisica`
  - `furtividade_magica`
  - `percepcao`
  - `ladinagem`
  - `medicina`
  - `historia`
  - `atletismo`
  - `intimidacao`
  - `persuasao`
  - `adestramento`
- derivados:
  - `derived.initiative`
  - `derived.dc`
  - `derived.carryMax`
  - `derived.carrySlots`
  - `derived.dcTable.mundana/desafiadora/lendaria/divina`

### Modelo de item

`module/documents/data/item-model.mjs` define:

- `description`
- `details.source/category/requirements/tags`
- `activation.cost/type`
- `range`, `duration`, `target`, `check`, `dc`, `damage`, `effect`
- `roll.axis`, `roll.aplicacao`, `roll.bonus`, `roll.isAttack`
- campos de magia:
  - `components`
  - `school`
  - `circle`
- campos gerais:
  - `level`
  - `price`
  - `quantity`
  - `equipped`
  - `slotCost`
- dados especificos de arma, armadura, escudo, runa e classe.

## Diagnostico da interface atual

O problema principal confirmado nao e falta de regras ou dados. O problema e apresentacao e experiencia.

### Ficha de ator

`templates/actor/actor.hbs` e um template grande, com muitas abas e secoes:

- `Base`
- `Origem`
- `Criacao`
- `Acoes`
- `Itens`
- `Magias`
- `Equipamentos`
- `Tracos`
- `Condicoes`
- `Monstro`
- `Descricao`

Problemas percebidos:

- A ficha parece uma pagina administrativa/formulario, nao uma tela de jogo.
- Muitos blocos usam o mesmo padrao visual:
  - `.panel`
  - `.item-section`
  - `.item-row`
  - `.item-actions`
- Existem listas repetidas de armas, magias, habilidades e itens em abas diferentes.
- A aba de pericias esta escondida na logica:
  - `const hiddenTabs = new Set(["pericias"]);`
- Mesmo com `SKILLS` e acao `roll-skill` preparadas em `actor-sheet.mjs`, as pericias nao aparecem como uma superficie forte da ficha.
- O usuario explicitamente rejeitou a sensacao de "pagina web simples".

### Ficha de item

`templates/item/item.hbs` e simples:

- Header com nome e tipo.
- Paineis para:
  - ativacao
  - rolagem
  - parametros
  - combate
  - magia
  - equipamento
  - arma/armadura/escudo por tipo
  - descricao

Problema:

- Funciona como formulario de dados, mas nao diferencia bem itens de jogo por papel narrativo/mecanico.

### CSS

O CSS carregado e `styles/pandorha-0.1.50.css`.

Ele define:

- fundo escuro radial;
- paineis claros;
- abas estilo botao;
- grids responsivos simples;
- linhas de item;
- estilos da quickbar.

Problemas:

- Visual geral ainda e generico.
- A combinacao de paineis claros e listas cria aparencia de pagina web/formulario.
- Nao ha uma composicao de ficha com "cockpit" de jogo: recursos grandes, acoes jogaveis, cartas de habilidade, estados, inventario util e leitura rapida.

## Macro e arquivos de importacao

### `scripts/macros/universal_roller.js`

Arquivo nao rastreado. Conteudo observado:

- Macro de Foundry com dialog.
- Permite escolher:
  - ataque
  - dano/cura
  - testes simples por Eixo + Aplicacao
  - pericias
- Usa token selecionado ou personagem do usuario.
- Em ataque, compara rolagem contra `targetActor.system.defenses.ca`.
- Em dano/cura, cria botoes no chat:
  - dano
  - metade
  - curar
- Registra listener global `globalThis.PandorhaMacroChatListener`.
- Aplica dano primeiro em PV e depois em HP.

Cuidados:

- O arquivo nao esta commitado.
- Parece macro externa/manual, nao integrada ao sistema como modulo.
- Ha risco de divergencia com `module/data/rolls.mjs`, que ja contem logica oficial de rolagem.
- Antes de integrar, decidir se a macro deve continuar solta ou virar feature nativa.

### `nova_macro_rolagem.md`

Arquivo nao rastreado. E uma instrucao de instalacao para a macro universal.

Conteudo:

- Diz que a macro esta em `scripts/macros/universal_roller.js`.
- Explica instalacao manual na barra de macros do Foundry.
- Explica uso para ataque, dano/cura, testes e pericias.

### `import_assets/assign_images.py`

Arquivo nao rastreado. Script Python que:

- Mapeia JSONs de bestiario/NPCs para arquivos de imagem.
- Atualiza `img` e `prototypeToken.texture.src`.
- Usa base:
  - `Campanhas/pacto_quebrado/assets-transparent/`
- Trabalha em JSONs dentro de `import_assets/bestiary` e `import_assets/npcs`.

Cuidados:

- Nao executar sem validar paths.
- Pode alterar JSONs de importacao.
- Nao parece atuar diretamente nos packs atuais, mas pode preparar dados para importacao.

## Conclusao tecnica sobre a critica do usuario

A critica do usuario procede tecnicamente:

- O sistema nao esta vazio.
- O sistema nao e apenas uma pagina web, porque tem documentos Foundry, packs, rolagens, modelos e quickbar.
- Mas a experiencia principal esta visualmente e ergonomicamente simples demais.
- O proximo trabalho deve focar em transformar a ficha em uma interface de RPG jogavel, nao em criar mais dados.

## Direcao recomendada para o proximo agente

Prioridade recomendada: refazer a ficha de personagem, mantendo dados e automacoes existentes.

Arquivos mais provaveis para alterar:

- `C:\Users\Pichau\Desktop\pandorha foundry\templates\actor\actor.hbs`
- `C:\Users\Pichau\Desktop\pandorha foundry\styles\pandorha-0.1.50.css`
- `C:\Users\Pichau\Desktop\pandorha foundry\module\applications\actor-sheet.mjs`

Nao mexer primeiro em:

- packs `.db`, salvo se o usuario pedir ou se houver uma correcao de dados especifica.
- `import_assets/`, salvo se o objetivo for importacao de bestiario/NPCs.
- macro universal, salvo se o usuario pedir integracao da macro.

Implementacao recomendada:

- Criar uma ficha com estrutura de "mesa de jogo":
  - cabecalho forte com retrato, nome, nivel, classe, ancestralidade e status geral;
  - recursos grandes e editaveis: HP, PV, EE, acoes, reacao, CA, iniciativa, movimento;
  - area de rolagem rapida com Eixo + Aplicacao + bonus + treinamento + MAP;
  - pericias visiveis, com botao de rolagem por pericia;
  - aba ou painel de acoes que mostre armas, manobras, magias e habilidades como cartas acionaveis;
  - inventario com equipar/desequipar, carga, defesa e runas em layout util;
  - condicoes como chips/etiquetas com efeitos legiveis;
  - criacao guiada mantida, mas visualmente redesenhada como fluxo de personagem, nao como formulario bruto.
- Reduzir repeticao visual entre abas.
- Usar campos existentes antes de criar schema novo.
- Preservar `data-action` existentes para nao quebrar handlers.
- Se criar novas classes CSS, usar nomes escopados por `.pandorha-sheet`.
- Atualizar o CSS que o manifesto realmente carrega: `styles/pandorha-0.1.50.css`.
- Se criar novo arquivo CSS, tambem atualizar `system.json`.
- Considerar bump de versao apenas quando o usuario pedir release/commit.

## Riscos e cuidados

- Worktree sujo: existem mudancas nao commitadas que nao devem ser revertidas.
- Os packs modificados podem conter mudancas de encoding/serializacao; revisar antes de commit.
- A saida do terminal mostrou acentos por vezes como mojibake em alguns arquivos, entao validar encoding antes de salvar arquivos com acentos.
- O manifesto carrega `styles/pandorha-0.1.50.css`; alterar somente `styles/pandorha.css` pode nao ter efeito no Foundry.
- A ficha usa ApplicationV2/HandlebarsApplicationMixin; manter compatibilidade com Foundry V13.
- Nao remover `data-action` ou nomes de inputs sem ajustar `actor-sheet.mjs`.
- A aba `pericias` esta escondida, mas a logica de pericias existe e deve ser reaproveitada.

## Registro do que foi feito nesta sessao

Comandos/acoes de investigacao executados:

- Verificado que `C:\Users\Pichau\Desktop\pandorha sistema 28-04` nao e repositorio Git.
- Listados arquivos do diretorio de regras/lore.
- Pesquisadas referencias a Foundry/templates/ficha.
- Localizada a pasta `C:\Users\Pichau\Desktop\pandorha foundry`.
- Lido `git status --short` do repositorio Foundry.
- Listados arquivos do repositorio Foundry.
- Lidos:
  - `templates/actor/actor.hbs`
  - `templates/item/item.hbs`
  - `module/applications/actor-sheet.mjs`
  - `styles/pandorha.css`
  - `styles/pandorha-0.1.50.css`
  - `system.json`
  - `module/pandorha.mjs`
  - `module/documents/data/actor-model.mjs`
  - `module/documents/data/item-model.mjs`
  - `scripts/macros/universal_roller.js`
  - `nova_macro_rolagem.md`
  - `import_assets/assign_images.py`
- Verificado que nao ha commits em `pandorha foundry` desde `2026-05-01 00:00`.
- Verificado que nao ha arquivos com `LastWriteTime` em `pandorha foundry` em 2026-05-01.
- Registrado diagnostico: a proxima etapa deve ser redesign da interface Foundry, nao criacao de uma pagina web separada.

## Estado final desta sessao

- Nenhum arquivo do modulo Foundry foi alterado por esta sessao.
- Este documento foi criado em:
  - `C:\Users\Pichau\Desktop\pandorha sistema 28-04\RELATORIO_PROJETO_PANDORHA_2026-05-01.md`
- O proximo modelo deve usar este documento como mapa inicial e depois reler os arquivos reais antes de editar.
