# Guia De Implementacao Completa Do Pandorha Engine

Este documento orienta a construcao incremental do jogo completo. Ele nao substitui as fontes de verdade do projeto; ele organiza a ordem de entrega para que cada feature seja funcional, inteligivel para o usuario e testavel no navegador do Codex.

## Fontes De Verdade

Toda tarefa deve consultar, no minimo, estes arquivos quando forem relevantes ao escopo:

- `AGENTS.md`: regras obrigatorias para agentes, idioma, intake, FSD, TDD e Result Pattern.
- `llms.txt`: mapa raiz de contexto para IA e contrato de linguagem.
- `docs/architecture/blueprint.md`: esquemas de dados e integridade referencial.
- `docs/architecture/gdd.md`: traducao das regras analogicas para logica computacional.
- `docs/architecture/sdd.md`: arquitetura de software, Svelte 5, SQLite WASM, OPFS, PWA e Worker.
- `docs/architecture/worker_rpc_spec.md`: contrato Main Thread <-> Web Worker.
- `docs/conventions/core-conventions.md`: convencoes tecnicas bloqueantes.
- `docs/conventions/styleguide.md`: identidade visual, tokens e direcao de UX.
- `docs/system/`: regras de RPG soberanas ao codigo.
- `lore/`: contexto narrativo, regioes e campanha.

## Visao De Produto

Pandorha Engine deve se tornar um jogo local-first, offline-capable, testavel e auditavel. O app final deve usar Svelte 5 para a interface, TypeScript estrito para contratos, Drizzle ORM como fonte de verdade dos schemas, SQLite WASM com OPFS para persistencia local e Web Worker para isolar I/O e processamento pesado.

O usuario deve conseguir testar cada feature pelo navegador do Codex assim que ela existir. Mesmo quando uma entrega for pequena, ela precisa deixar claro:

- o que foi implementado;
- por que isso importa para o jogo;
- como o usuario testa no navegador;
- quais limitacoes ainda existem;
- qual e o proximo passo seguro.

## Regra De Entrega

Nenhuma feature e considerada pronta sem:

- branch propria para a feature;
- analise previa do projeto e Execution Profile informado ao usuario;
- fonte de regra lida e citada quando houver regra de RPG;
- teste escrito antes da implementacao de service/domain;
- fake em memoria para testes de unidade;
- Result Pattern para falhas esperadas;
- validacao Drizzle-Zod em fronteiras de dados;
- 100% de cobertura em services e domain logic;
- validacao com MCPs relevantes;
- documentacao de usuario em pt-BR;
- teste no navegador do Codex quando houver UI;
- registro em `docs/process/task-ledger.md`;
- revisao antes da proxima tarefa.

## Arquitetura Base

O codigo deve seguir Feature-Sliced Design:

- `app`: inicializacao, providers, roteamento state-driven e bootstrapping.
- `pages`: telas navegaveis.
- `widgets`: composicoes de UI sem regra de dominio.
- `features`: acoes do usuario e fluxos de gameplay.
- `entities`: entidades base compartilhadas, como Character, Item, Spell e WorldTile.
- `shared`: infraestrutura generica, Result, constantes, RPC, logger, event bus e utilitarios.

Regras tecnicas obrigatorias:

- Drizzle schema e Drizzle-Zod sao a fonte de verdade de dados persistidos.
- Services contem regra de negocio; repositories contem acesso ao banco.
- SQLite WASM nao deve aparecer em testes unitarios de dominio.
- Valores derivados de jogo devem ser calculados sob demanda, nao persistidos como verdade final, salvo decisao explicita no blueprint.
- O Web Worker deve responder com Result/RPCResponse, nunca lancar erro para a UI.
- UI deve ser pt-BR e usar tokens do `styleguide.md`, sem cores padrao do Tailwind.

## Ordem Macro De Implementacao

1. Fundacao do app Svelte/browser testavel.
2. Persistencia real de `Character`.
3. Criador de personagem jogavel.
4. Entidades base: ancestralidade, classe, antecedentes, talentos e equipamento.
5. Compendio consultavel.
6. Dice/Resolution engine.
7. Inventario, carga e equipamento.
8. Combate vertical slice.
9. Magia/metamagia.
10. Exploracao/hexcrawl.
11. Acampamento, downtime e bastiao.
12. Social, faccoes, fama e infamia.
13. World state, eventos, clocks e saves.
14. PWA/offline, polish e QA final.

## Como Cada Feature Deve Ser Testavel Pelo Usuario

Toda feature com UI deve entregar uma rota, tela, painel ou controle acessivel no navegador do Codex. O teste do usuario deve ser escrito no fim da tarefa em linguagem simples:

- abrir a URL local;
- navegar ate a tela;
- executar uma acao concreta;
- observar um resultado esperado;
- confirmar uma mensagem de erro quando houver entrada invalida.

Exemplo de formato:

```text
Como testar no navegador:
1. Abra http://localhost:<porta>.
2. Clique em "Personagens".
3. Preencha os Eixos com 3/2/1 e Aplicacoes com 2/1/3.
4. Clique em "Criar personagem".
5. Confirme que o personagem aparece na lista e que uma distribuicao invalida mostra erro em pt-BR.
```

## Definition Of Done Por Feature

Uma feature so pode ser encerrada quando todos os itens abaixo estiverem verdadeiros:

- Branch criada para a feature ou modificacao.
- Plano curto aprovado quando o escopo tocar mais de 2 arquivos, regras de RPG ou banco.
- Tests first aplicado em service/domain.
- `npm.cmd run lint` passou.
- `npm.cmd test` passou.
- `npm.cmd run test:coverage` passou quando houver service/domain.
- `npm.cmd run quality:gate` passou ou o bloqueio foi registrado.
- MCPs relevantes foram executados.
- Browser test foi executado quando houver UI.
- Usuario recebeu "o que foi implementado" e "como testar".
- `.context` do modulo foi atualizado quando houver feature/modulo.
- `python scripts/pandorha_process_automation.py snapshot --reason <slug>` foi executado.
- Diff revisado antes da proxima tarefa.

## Ordem De Validacao Por Tipo De Entrega

Para docs:

- Conferir links e referencias.
- Rodar `npm.cmd run lint`.
- Rodar `npm.cmd test`.
- Rodar `npm.cmd run quality:gate` quando a mudanca alterar processo oficial.

Para dominio:

- Testes unitarios com fakes.
- Coverage 100% em service/domain.
- MCP `pandorha-knowledge` para regra de RPG.
- MCP `pandorha-arch-guard` para fronteiras FSD.

Para persistencia:

- Testes de contrato de repository.
- Drizzle-Zod nas fronteiras.
- MCP `pandorha-db-auditor` quando houver banco real.
- Migration revisada antes de ser aplicada.

Para UI:

- Teste manual no navegador do Codex.
- Screenshot ou descricao objetiva do estado validado.
- UI copy em pt-BR.
- Tokens do `styleguide.md`.

## Risco Principal E Mitigacao

O maior risco e tentar implementar sistemas grandes demais de uma vez e misturar regra, UI, banco e automacao no mesmo passo. A mitigacao obrigatoria e quebrar tudo em microtarefas com revisao entre elas, como definido em `docs/process/microtask-delivery-plan.md`.
