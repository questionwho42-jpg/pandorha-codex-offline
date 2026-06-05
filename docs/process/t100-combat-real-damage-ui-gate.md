# T100 Combat Real Damage UI Gate

Status: decision gate, no UI code.

Depends on: `20260605-183829-t99-combat-real-damage-event-contract`.

## Objetivo

Definir quando o contrato `realDamageReceived` pode aparecer na UI de combate sem sugerir que HP real persistido, save v6, Moribundo, Inconsciente, durabilidade, concentracao, DoT ou monstros oficiais ja existem.

## Decisao Atual

Nao expor T99 na UI ainda.

O contrato T99 registra eventos append-only de dano real, mas o replay de HP real, persistencia de ledger, save-version e consequencias terminais ainda nao estao aprovados. A tela atual deve continuar mostrando apenas `HP de treino` local.

## Condicoes Para Abrir A Primeira UI

- Replay de HP real definido como contrato puro e coberto por testes.
- Copy aprovada dizendo claramente se o dado e treino, preview ou dano persistido.
- Nenhuma mudanca em `docs/system/` por inferencia do codigo.
- Nenhum save v6, migration ou Worker ate haver gate especifico de persistencia.
- Validador renderizado obrigatorio com Playwright no navegador contra `127.0.0.1`.

## Validacao UI Obrigatoria Quando Houver Tela

1. Rodar `npm.cmd run qa:vertical-slice`.
2. Subir o app com `npm.cmd run dev` ou `npm.cmd run preview`.
3. Usar Playwright CLI ou navegador interno do Codex para validar o fluxo renderizado:
   - status `Offline disponivel neste navegador.`;
   - criacao de personagem valido;
   - aba `Combate`;
   - selecao do personagem;
   - ataque recebido de treino;
   - exibicao de `HP de treino`;
   - ausencia de promessa visual de HP real persistido.
4. Salvar evidencias em `output/playwright/`.

## Proxima Tarefa Recomendada

Antes de UI: criar uma tarefa de replay puro de HP real a partir de eventos `realDamageReceived`, ainda sem save, banco ou Svelte.
