# Plano De Microtarefas Do Pandorha Engine

Este documento divide a implementacao do jogo completo em tarefas pequenas, revisaveis e testaveis. Ele deve ser usado junto com `docs/process/complete-game-implementation-guide.md`.

## Protocolo De Cada Tarefa

Cada tarefa deve seguir esta sequencia:

1. Criar branch propria: `task/<feature-slug>`. Se o Git local nao permitir refs com barra, usar `task-<feature-slug>` e registrar o motivo.
2. Informar o Execution Profile: modelo, raciocinio, Plan mode, contexto da IDE, skills, MCPs, comandos e arquivos de configuracao.
3. Registrar a tarefa com `python scripts/pandorha_process_automation.py start`.
4. Ler as fontes de verdade aplicaveis: `AGENTS.md`, `llms.txt`, `blueprint.md`, `gdd.md`, `sdd.md`, `worker_rpc_spec.md`, `core-conventions.md`, `styleguide.md` e arquivos de `docs/system/`.
5. Escrever o menor teste que falha antes de service/domain.
6. Implementar o minimo necessario.
7. Validar no navegador do Codex quando houver UI.
8. Documentar "o que foi implementado" e "como testar".
9. Rodar gate total.
10. Revisar diff, riscos e arquivos tocados.
11. Commitar apenas os arquivos da tarefa.
12. Enviar para a branch especifica somente com confirmacao explicita de push.

## Gate Total

O gate padrao para liberar a proxima tarefa e:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run test:coverage
npm.cmd run quality:gate
python scripts/pandorha_process_automation.py snapshot --reason <task-slug>
```

Quando houver UI, tambem e obrigatorio testar no navegador do Codex e registrar como o usuario repete o teste.

## Template De Tarefa

```markdown
## TXX - Nome Da Tarefa

- Branch: `task/<feature-slug>`
- Objetivo:
- Fonte de verdade:
- Escopo maximo:
- Arquivos esperados:
- Testes esperados:
- Teste do usuario no navegador:
- MCPs/skills:
- Criterios de aceite:
- Riscos:
- Decisao de revisao:
```

## Backlog Inicial

### Fundacao De Processo

#### T00 - Fechar Regras De Governanca Pendentes

- Branch: `task/game-roadmap-docs` ou fallback `task-game-roadmap-docs`.
- Objetivo: commitar as regras de idioma e intake ja registradas em `AGENTS.md` e `llms.txt`.
- Fonte de verdade: `AGENTS.md`, `llms.txt`.
- Escopo maximo: governanca e snapshot de processo.
- Testes esperados: `npm.cmd run lint`, `npm.cmd test`.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-maintenance`.
- Criterios de aceite: commit separado antes dos documentos.
- Riscos: misturar regra de processo com roadmap.
- Decisao de revisao: confirmar diff sem `Untitled-1.md`.

#### T01 - Criar Documentos De Planejamento Completo

- Branch: mesma branch da T00.
- Objetivo: criar `complete-game-implementation-guide.md` e `microtask-delivery-plan.md`.
- Fonte de verdade: `AGENTS.md`, `llms.txt`, `blueprint.md`, `gdd.md`, `sdd.md`, `worker_rpc_spec.md`, `core-conventions.md`, `styleguide.md`.
- Escopo maximo: documentacao de processo, sem codigo de jogo.
- Testes esperados: existencia dos dois documentos, referencias obrigatorias, gate total.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-maintenance`, `pandorha-knowledge`.
- Criterios de aceite: documentos explicam browser test, branch propria, revisao e microtarefas.
- Riscos: plano amplo demais sem tarefas acionaveis.
- Decisao de revisao: revisar se cada tarefa tem objetivo, teste e aceite.

### Fundacao Do App Navegavel

#### T02 - Scaffold Minimo Svelte 5/Vite

- Branch: `task/svelte-app-shell`.
- Objetivo: adicionar app Svelte minimo sem regra de jogo.
- Fonte de verdade: `sdd.md`, `core-conventions.md`, `styleguide.md`.
- Escopo maximo: dependencias, configs e tela vazia inicial.
- Testes esperados: lint, typecheck, smoke test de build.
- Teste do usuario no navegador: abrir app e ver shell vazio com titulo Pandorha.
- MCPs/skills: `core-conventions`, Browser Use.
- Criterios de aceite: servidor local abre no Codex browser.
- Riscos: conflito entre Vite/Svelte e aliases atuais.
- Decisao de revisao: nenhum dominio de RPG nesta tarefa.

#### T03 - Navegacao State-Driven Inicial

- Branch: `task/state-driven-navigation`.
- Objetivo: criar navegacao sem URL para telas placeholder.
- Fonte de verdade: `sdd.md`.
- Escopo maximo: telas `Inicio`, `Personagens`, `Compendio`.
- Testes esperados: teste de estado de navegacao se extraido para service.
- Teste do usuario no navegador: clicar tabs e confirmar troca de tela.
- MCPs/skills: `core-conventions`, Browser Use.
- Criterios de aceite: UI em pt-BR e sem regra de negocio.
- Riscos: colocar logica demais em componente.
- Decisao de revisao: validar Container/Presenter se houver componentes.

#### T04 - Shell Visual Com Styleguide

- Branch: `task/visual-shell-styleguide`.
- Objetivo: aplicar tokens visuais oficiais ao shell.
- Fonte de verdade: `styleguide.md`.
- Escopo maximo: layout, tokens, tipografia e estados vazios.
- Testes esperados: lint e inspecao visual.
- Teste do usuario no navegador: confirmar contraste, leitura e ausencia de cores Tailwind default.
- MCPs/skills: `core-conventions`, Browser Use.
- Criterios de aceite: UI legivel e coerente com pt-BR.
- Riscos: decoracao excessiva antes do gameplay.
- Decisao de revisao: preservar usabilidade.

### Character E Criacao De Personagem

#### T05 - Testes De Contrato Do DrizzleCharacterRepository

- Branch: `task/character-repository-contract`.
- Objetivo: provar o adapter Drizzle com fake query builder.
- Fonte de verdade: `blueprint.md`, `characterSchema.ts`.
- Escopo maximo: testes de save/findById, sem migration real.
- Testes esperados: sucesso, not found, retorno corrompido e falha de escrita.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `core-conventions`, `pandorha-arch-guard`.
- Criterios de aceite: adapter coberto sem SQLite WASM em unit test.
- Riscos: fake ficar acoplado demais a detalhes de Drizzle.
- Decisao de revisao: confirmar que business errors retornam Result.

#### T06 - Migration Inicial De Characters

- Branch: `task/characters-migration`.
- Objetivo: configurar Drizzle migration para tabela `characters`.
- Fonte de verdade: `blueprint.md`, `worker_rpc_spec.md`.
- Escopo maximo: config Drizzle e migration inicial.
- Testes esperados: migration gerada/aplicada em banco temporario.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-db-auditor`.
- Criterios de aceite: schema real bate com Drizzle-Zod.
- Riscos: escolher driver SQLite/WASM errado cedo demais.
- Decisao de revisao: registrar decisao de driver antes de seguir.

#### T07 - Listagem De Personagens

- Branch: `task/character-list-ui`.
- Objetivo: exibir personagens existentes em tela.
- Fonte de verdade: `sdd.md`, `styleguide.md`.
- Escopo maximo: lista read-only usando fake ou repository real disponivel.
- Testes esperados: service/query com fake, browser test.
- Teste do usuario no navegador: abrir Personagens e ver lista ou estado vazio.
- MCPs/skills: Browser Use, `core-conventions`.
- Criterios de aceite: usuario entende se nao ha personagens.
- Riscos: misturar criacao antes da listagem estar estavel.
- Decisao de revisao: validar texto pt-BR.

#### T08 - Criacao De Personagem 6/6

- Branch: `task/character-create-form`.
- Objetivo: permitir criar personagem pela UI com regra 6/6.
- Fonte de verdade: `00-mecanicas-fundamentais.md`, `guia-criacao-de-ficha.md`.
- Escopo maximo: formulario basico sem ancestralidade/classe completas.
- Testes esperados: service/domain ja cobertos, teste de adapter UI se extraido.
- Teste do usuario no navegador: preencher 3/2/1 e 2/1/3, criar e ver na lista.
- MCPs/skills: `pandorha-knowledge`, Browser Use.
- Criterios de aceite: entrada invalida nao persiste.
- Riscos: duplicar regra de dominio na UI.
- Decisao de revisao: UI deve chamar service, nao recalcular regra final.

#### T09 - Feedback De Erro Em pt-BR

- Branch: `task/character-error-copy`.
- Objetivo: traduzir falhas de Character para mensagens claras.
- Fonte de verdade: `AGENTS.md`, `llms.txt`.
- Escopo maximo: mapper de erro e exibicao no formulario.
- Testes esperados: mapper cobre cada failure code.
- Teste do usuario no navegador: inserir soma invalida e ler erro em pt-BR.
- MCPs/skills: Browser Use.
- Criterios de aceite: erro orienta correcao.
- Riscos: expor mensagens tecnicas do dominio ao usuario.
- Decisao de revisao: manter codigos tecnicos fora da UI.

#### T10 - Guia De Usuario Para Criar Personagem

- Branch: `task/character-user-docs`.
- Objetivo: documentar como criar personagem no app.
- Fonte de verdade: `00-mecanicas-fundamentais.md`.
- Escopo maximo: guia curto em `docs/user/`.
- Testes esperados: revisao de links e comandos.
- Teste do usuario no navegador: seguir o guia e criar personagem.
- MCPs/skills: `pandorha-knowledge`.
- Criterios de aceite: usuario leigo consegue testar.
- Riscos: documentacao divergir da UI.
- Decisao de revisao: guia deve citar versao/estado da feature.

### Entidades Base

#### T11 - Schema De Ancestralidade

- Branch: `task/ancestry-schema`.
- Objetivo: criar schema, zod e tipos de ancestralidade.
- Fonte de verdade: `01-ancestralidades.md` e arquivos `01-*`.
- Escopo maximo: dados base, sem UI.
- Testes esperados: validacao de schema e service minimo.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-knowledge`, `pandorha-arch-guard`.
- Criterios de aceite: nenhum dado sem validacao.
- Riscos: carregar lore demais numa unica entidade.
- Decisao de revisao: separar traits em tarefa propria.

#### T12 - Traits De Ancestralidade

- Branch: `task/ancestry-traits`.
- Objetivo: modelar traits e relacao com ancestralidade.
- Fonte de verdade: `blueprint.md`, `01-ancestralidades.md`.
- Escopo maximo: schema N:N e service de escolha.
- Testes esperados: escolher 3 traits no nivel 1.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-knowledge`.
- Criterios de aceite: escolha invalida retorna Result.
- Riscos: regras especificas por ancestralidade ficarem implicitas.
- Decisao de revisao: registrar regras especiais no contexto do modulo.

#### T13 - Schema De Classes

- Branch: `task/character-class-schema`.
- Objetivo: modelar classes e bonus base.
- Fonte de verdade: `05-00-regras-de-classe.md` e arquivos `05-*`.
- Escopo maximo: schema e service read-only.
- Testes esperados: validacao de classe e bonus.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-knowledge`.
- Criterios de aceite: classes podem alimentar derived stats.
- Riscos: formulas divergentes de HP/PV/EE.
- Decisao de revisao: bloquear derived stats ate classe estar estavel.

#### T14 - Antecedentes

- Branch: `task/background-schema`.
- Objetivo: modelar antecedentes/origens.
- Fonte de verdade: `10-antecedentes-e-origens.md`.
- Escopo maximo: schema, zod e service read-only.
- Testes esperados: dados validos/invalidos.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-knowledge`.
- Criterios de aceite: Character pode referenciar background existente.
- Riscos: confundir origem narrativa com ancestralidade.
- Decisao de revisao: manter nomes e textos de usuario em pt-BR.

#### T15 - Derived Stats De Character

- Branch: `task/character-derived-stats`.
- Objetivo: calcular HP, PV, EE, CA, iniciativa e carga sem persistir valores finais.
- Fonte de verdade: `blueprint.md`, `gdd.md`, regras de classe e carga.
- Escopo maximo: service puro com fakes de classe/equipamento.
- Testes esperados: todas as formulas e limites conhecidos.
- Teste do usuario no navegador: exibir painel de stats calculados se UI existir.
- MCPs/skills: `pandorha-knowledge`, `pandorha-arch-guard`.
- Criterios de aceite: 100% coverage.
- Riscos: regra incompleta de classe.
- Decisao de revisao: registrar qualquer formula pendente como blocker.

### Compendio

#### T16 - Importador De Conteudo Validado

- Branch: `task/compendium-content-import`.
- Objetivo: carregar conteudo estatico validado por Zod.
- Fonte de verdade: `docs/system/`, `lore/`.
- Escopo maximo: pipeline minimo para um tipo de entrada.
- Testes esperados: fixture valida e invalida.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-knowledge`.
- Criterios de aceite: erro estruturado para conteudo invalido.
- Riscos: tentar importar todo o corpus de uma vez.
- Decisao de revisao: limitar a um conjunto pequeno.

#### T17 - UI De Compendio Consultavel

- Branch: `task/compendium-browser-ui`.
- Objetivo: pesquisar e abrir entradas do compendio.
- Fonte de verdade: `sdd.md`, `styleguide.md`.
- Escopo maximo: busca simples e detalhes.
- Testes esperados: service de busca com fake.
- Teste do usuario no navegador: pesquisar "Vanguarda" e abrir resultado.
- MCPs/skills: Browser Use.
- Criterios de aceite: usuario entende origem da regra.
- Riscos: busca lenta se consultar corpus bruto.
- Decisao de revisao: paginar resultados.

### Resolucao, Dados E Combate

#### T18 - DiceService Auditavel

- Branch: `task/dice-service`.
- Objetivo: centralizar rolagens e proibir `Math.random()` direto.
- Fonte de verdade: `sdd.md`, `gdd.md`.
- Escopo maximo: rolagem deterministica injetavel em testes.
- Testes esperados: seed/fake RNG, d20, critico natural.
- Teste do usuario no navegador: painel dev rola d20 se existir UI.
- MCPs/skills: `pandorha-arch-guard`.
- Criterios de aceite: nenhuma regra usa RNG direto.
- Riscos: auditoria persistente adiada.
- Decisao de revisao: registrar persistencia de audit log como tarefa futura.

#### T19 - ResolutionService

- Branch: `task/resolution-service`.
- Objetivo: calcular teste global d20 + nivel + eixo + aplicacao + bonus.
- Fonte de verdade: `00-mecanicas-fundamentais.md`, `gdd.md`.
- Escopo maximo: service puro.
- Testes esperados: sucesso, falha, critico natural, falha natural, margem +10.
- Teste do usuario no navegador: painel de teste se UI existir.
- MCPs/skills: `pandorha-knowledge`.
- Criterios de aceite: todos os graus retornam Result tipado.
- Riscos: misturar dano com resolucao geral.
- Decisao de revisao: dano fica fora desta tarefa.

#### T20 - ActionQueue Minima

- Branch: `task/action-queue`.
- Objetivo: criar fila deterministica de comandos.
- Fonte de verdade: `feature_state_machines.md`.
- Escopo maximo: enqueue/process de comandos fake.
- Testes esperados: FIFO, interrupcao LIFO quando definida, falha tipada.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-arch-guard`.
- Criterios de aceite: comandos nao executam fora da queue.
- Riscos: event sourcing crescer demais.
- Decisao de revisao: manter comandos de exemplo.

#### T21 - Damage Pipeline Minimo

- Branch: `task/damage-pipeline`.
- Objetivo: implementar pipeline base -> critico -> reducao -> afinidade.
- Fonte de verdade: `18-tratado-de-dano.md`, `feature_state_machines.md`.
- Escopo maximo: service puro sem UI.
- Testes esperados: cada fase isolada e pipeline completo.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-knowledge`.
- Criterios de aceite: usar composition/decorator quando houver modificadores.
- Riscos: codificar casos de monstros cedo demais.
- Decisao de revisao: somente tipos de afinidade fundamentais.

#### T22 - Combate Vertical Slice UI

- Branch: `task/combat-vertical-slice-ui`.
- Objetivo: um encontro simples com um personagem e um inimigo.
- Fonte de verdade: `gdd.md`, `feature_state_machines.md`, `styleguide.md`.
- Escopo maximo: atacar, ver log e encerrar turno.
- Testes esperados: services cobertos, browser test obrigatorio.
- Teste do usuario no navegador: iniciar combate, atacar, ver dano e log.
- MCPs/skills: Browser Use, `pandorha-knowledge`.
- Criterios de aceite: usuario consegue completar um turno.
- Riscos: UI esconder erros de dominio.
- Decisao de revisao: preservar log claro em pt-BR.

### Inventario E Equipamento

#### T23 - Schema De Equipment E Consumables

- Branch: `task/equipment-schema`.
- Objetivo: modelar itens unicos e consumiveis empilhados.
- Fonte de verdade: `blueprint.md`, `04-arsenal-e-economia.md`.
- Escopo maximo: schema e validacao.
- Testes esperados: item unico, consumivel, invalidos.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-knowledge`.
- Criterios de aceite: Drizzle-Zod cobre entrada/saida.
- Riscos: tentar modelar todo arsenal.
- Decisao de revisao: usar fixtures pequenas.

#### T24 - InventoryCapacityService

- Branch: `task/inventory-capacity`.
- Objetivo: calcular slots por Fisico + Resistencia + 6.
- Fonte de verdade: `gdd.md`, `regras-peso-carga.md`.
- Escopo maximo: service puro.
- Testes esperados: limites, sobrecarga e dados invalidos.
- Teste do usuario no navegador: painel de carga se UI existir.
- MCPs/skills: `pandorha-knowledge`.
- Criterios de aceite: nao persistir total derivado.
- Riscos: peso e slots divergirem.
- Decisao de revisao: registrar regra adotada.

#### T25 - UI De Inventario Minima

- Branch: `task/inventory-ui`.
- Objetivo: mostrar itens, carga e estado de maos.
- Fonte de verdade: `sdd.md`, `styleguide.md`.
- Escopo maximo: read-only com dados fake ou persistidos.
- Testes esperados: service coberto e browser test.
- Teste do usuario no navegador: abrir inventario e ver carga calculada.
- MCPs/skills: Browser Use.
- Criterios de aceite: usuario entende limite e excesso.
- Riscos: permitir mutacao antes de service existir.
- Decisao de revisao: bloquear edicao nesta tarefa.

### Magia

#### T26 - Spell Schema Minimo

- Branch: `task/spell-schema`.
- Objetivo: modelar metadados de magia.
- Fonte de verdade: `12-00-codex-de-magia.md`, grimorios.
- Escopo maximo: schema de uma amostra de magias.
- Testes esperados: circulo, custo, tags.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `magic-validator`, `pandorha-knowledge`.
- Criterios de aceite: entrada invalida falha com Result.
- Riscos: corpus de magia muito grande.
- Decisao de revisao: usar amostra controlada.

#### T27 - SpellCastBuilder

- Branch: `task/spell-cast-builder`.
- Objetivo: Draft -> Weaving -> Audit -> Commit.
- Fonte de verdade: `feature_state_machines.md`, `worker_rpc_spec.md`.
- Escopo maximo: service puro sem UI.
- Testes esperados: custo EE, alvo invalido, metamagia invalida.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `magic-validator`.
- Criterios de aceite: nenhuma magia entra direto na ActionQueue.
- Riscos: metamagia incompleta.
- Decisao de revisao: declarar tags suportadas.

#### T28 - UI De Conjuracao Minima

- Branch: `task/spell-casting-ui`.
- Objetivo: escolher magia, ver custo e conjurar em alvo.
- Fonte de verdade: `styleguide.md`, `feature_state_machines.md`.
- Escopo maximo: uma magia funcional.
- Testes esperados: services e browser test.
- Teste do usuario no navegador: selecionar magia, confirmar custo, conjurar.
- MCPs/skills: Browser Use, `magic-validator`.
- Criterios de aceite: erro de EE insuficiente em pt-BR.
- Riscos: UI complexa demais.
- Decisao de revisao: uma magia, um alvo.

### Exploracao, Mundo E Saves

#### T29 - WorldTile Schema

- Branch: `task/world-tile-schema`.
- Objetivo: modelar hexcrawl com coordenadas axiais.
- Fonte de verdade: `blueprint.md`, `c-dex-de-hexcrawl-e-explora-o.md`.
- Escopo maximo: schema e validacao de coordenadas.
- Testes esperados: tiles validos, region_tier, coordenadas invalidas.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `hexcrawl-generator`, `pandorha-knowledge`.
- Criterios de aceite: sem mapa visual ainda.
- Riscos: gerar mundo antes do schema.
- Decisao de revisao: manter fixture pequena.

#### T30 - Hexcrawl MovementService

- Branch: `task/hexcrawl-movement`.
- Objetivo: mover grupo entre hexes adjacentes.
- Fonte de verdade: `c-dex-de-hexcrawl-e-explora-o.md`.
- Escopo maximo: service puro.
- Testes esperados: adjacente, bloqueado, desconhecido, encontro disparado.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `hexcrawl-generator`.
- Criterios de aceite: falhas tipadas.
- Riscos: misturar encounter table.
- Decisao de revisao: encontro apenas como evento.

#### T31 - UI De Mapa Hexcrawl Minima

- Branch: `task/hexcrawl-map-ui`.
- Objetivo: mostrar tiles e permitir movimento simples.
- Fonte de verdade: `styleguide.md`, `sdd.md`.
- Escopo maximo: mapa pequeno fixo.
- Testes esperados: service coberto e browser test.
- Teste do usuario no navegador: clicar hex adjacente e ver posicao mudar.
- MCPs/skills: Browser Use, `hexcrawl-generator`.
- Criterios de aceite: desconhecido visualmente claro.
- Riscos: mapa visual consumir escopo demais.
- Decisao de revisao: sem geracao procedural nesta tarefa.

#### T32 - WorldState Key-Value

- Branch: `task/world-state-kv`.
- Objetivo: persistir flags globais.
- Fonte de verdade: `blueprint.md`, `world-state-manager`.
- Escopo maximo: schema, service e fake.
- Testes esperados: set/get, not found, tipo invalido.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `world-state-manager`, `pandorha-db-auditor`.
- Criterios de aceite: narrativa nao assume estado sem query.
- Riscos: flags sem namespace.
- Decisao de revisao: definir prefixos.

#### T33 - Save/Load Inicial

- Branch: `task/save-load-initial`.
- Objetivo: salvar e carregar estado minimo.
- Fonte de verdade: `worker_rpc_spec.md`, `feature_state_machines.md`.
- Escopo maximo: Character + WorldState.
- Testes esperados: roundtrip, save corrompido, migration pendente.
- Teste do usuario no navegador: criar personagem, recarregar app, confirmar persistencia.
- MCPs/skills: Browser Use, `pandorha-db-auditor`.
- Criterios de aceite: resultado visivel ao usuario.
- Riscos: OPFS/Worker instavel.
- Decisao de revisao: registrar limitacoes de ambiente.

### Social, Downtime E Finalizacao

#### T34 - ClockService

- Branch: `task/clock-service`.
- Objetivo: modelar relogios de progresso.
- Fonte de verdade: `blueprint.md`, `gdd.md`.
- Escopo maximo: criar, avancar e completar clock.
- Testes esperados: progresso, overflow, trigger emitido.
- Teste do usuario no navegador: painel dev se existir UI.
- MCPs/skills: `pandorha-arch-guard`.
- Criterios de aceite: triggers como eventos, nao side effects escondidos.
- Riscos: clocks virarem agenda generica.
- Decisao de revisao: escopo de RPG apenas.

#### T35 - CampService Minimo

- Branch: `task/camp-service`.
- Objetivo: alocar slots de acampamento.
- Fonte de verdade: `28-codex-acampamento-descanso-ativo.md`.
- Escopo maximo: vigilia, reparo, cozinhar.
- Testes esperados: alocacao valida, conflito, descanso interrompido.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-knowledge`.
- Criterios de aceite: falhas em pt-BR na UI futura.
- Riscos: downtime amplo demais.
- Decisao de revisao: limitar a uma noite de acampamento.

#### T36 - Social Standing Service

- Branch: `task/social-standing`.
- Objetivo: fama, divida e faccao.
- Fonte de verdade: `21-mecanicas-de-fama-e-influencia.md`, `31-codex-teia-infamia-patrocinio.md`.
- Escopo maximo: service puro.
- Testes esperados: fame, blood_debt, bloqueio de descanso.
- Teste do usuario no navegador: nao aplicavel.
- MCPs/skills: `pandorha-knowledge`.
- Criterios de aceite: regra `divida > fama * 3` coberta.
- Riscos: confundir reputacao local e global.
- Decisao de revisao: registrar modelo escolhido.

#### T37 - PWA Offline Smoke

- Branch: `task/pwa-offline-smoke`.
- Objetivo: instalar service worker e cache minimo.
- Fonte de verdade: `sdd.md`.
- Escopo maximo: app carrega offline apos primeiro load.
- Testes esperados: build e browser/offline smoke quando disponivel.
- Teste do usuario no navegador: carregar app, simular offline, recarregar.
- MCPs/skills: Browser Use.
- Criterios de aceite: sem prometer sync remoto.
- Riscos: cache esconder bugs.
- Decisao de revisao: versionar cache.

#### T38 - QA Final Do Vertical Slice

- Branch: `task/vertical-slice-qa`.
- Objetivo: revisar fluxo completo personagem -> exploracao -> combate -> save.
- Fonte de verdade: todos os documentos de arquitetura e sistema envolvidos.
- Escopo maximo: bugfixes pequenos e documentacao de teste.
- Testes esperados: quality gate, browser walkthrough, auditoria de banco.
- Teste do usuario no navegador: executar roteiro completo documentado.
- MCPs/skills: Browser Use, `pandorha-db-auditor`, `pandorha-arch-guard`.
- Criterios de aceite: usuario consegue repetir o fluxo.
- Riscos: acumular correcoes demais.
- Decisao de revisao: abrir novas tarefas para bugs maiores.

## Regra Para T11+

Depois de T10, cada sistema macro deve continuar no mesmo formato:

1. Schema Drizzle.
2. Drizzle-Zod.
3. Repository contract.
4. Fake em memoria.
5. Service com Result Pattern.
6. Testes 100%.
7. UI minima no navegador quando aplicavel.
8. Documentacao "o que foi implementado" e "como testar".
9. MCPs relevantes.
10. Gate total.
11. Revisao antes da proxima tarefa.

Nenhuma tarefa deve tentar completar um sistema inteiro se uma subtarefa menor puder ser validada isoladamente.
