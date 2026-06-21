# Gate De Orquestracao Multi-Hora De Acampamento

## Objetivo

Este gate prepara a proxima evolucao segura do Acampamento: permitir que a UI
inicie uma nova hora ou uma noite encadeada sem confundir a hora ja resolvida,
o estado restaurado do save e um reset manual da sessao.

Ele nao aprova cura real, remocao de exaustao, kits, reparo de equipamento,
desgaste, encontros aleatorios, crafting, consumo de recursos, HP real ou
mudancas em `docs/system/`.

## Fontes Revisadas

- Fluxo atual da vertical slice: [vertical-slice-qa.md](./vertical-slice-qa.md).
- Roadmap de alcance da UI: [ui-reachability-follow-up-roadmap.md](./ui-reachability-follow-up-roadmap.md).
- Memoria local do modulo: `src/features/camp-hour/.context/scaling-roadmap.md`.
- Automacao de runbook: [browser-qa-runbook.md](./browser-qa-runbook.md).

## Contrato Aprovado Para A Proxima Microtarefa

A proxima microtarefa pode adicionar somente:

- estado explicito para `hora resolvida`, `nova hora pronta`, `sessao restaurada`
  e `reset manual`;
- comando visivel em pt-BR para preparar a proxima hora depois de uma resolucao;
- preservacao do log da hora recem-resolvida ate o usuario iniciar a proxima;
- smoke contratual em `qa:ui-reachability` ou `qa:vertical-slice` se a copy ou
  o fluxo de aba mudar;
- validacao renderizada no Browser do Codex quando a UI for alterada.

## Fora Do Escopo

- noite completa automatica;
- rolagens de atividade, kits, cura, exaustao, encontro e recuperacao;
- persistencia nova ou aumento de versao de save;
- reparo de durabilidade, custos, crafting ou desgaste;
- qualquer regra nova em `docs/system/`.

## Criterios De Aceite

- A hora atual continua encerrada ate o usuario pedir a proxima.
- Save/load v9 nao muda de formato.
- O estado restaurado de save nao sobrescreve o log imediato da hora resolvida.
- O usuario entende a diferenca entre continuar, restaurar e reiniciar.
- Gates minimos: `npm.cmd run qa:ui-reachability`,
  `npm.cmd run qa:vertical-slice`, `npm.cmd run qa:browser-runbook:check` e
  Browser do Codex se houver UI.

## Decisao

A fase de Acampamento multi-hora permanece documental ate este gate ser usado
por uma tarefa pequena, com TDD e sem ampliar regras soberanas por inferencia.
