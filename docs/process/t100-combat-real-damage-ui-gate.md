# T100 Combat Real Damage UI Gate

Status: gate satisfied for local preview UI; persistence gate remains closed.

Depends on: `20260605-183829-t99-combat-real-damage-event-contract`.

## Objetivo

Definir quando o contrato `realDamageReceived` pode aparecer na UI de combate sem sugerir que HP real persistido, save v6, Moribundo, Inconsciente, durabilidade, concentracao, DoT ou monstros oficiais ja existem.

## Decisao Atual

Expor somente a `Previa local de HP real`, separada do `HP de treino`.

T101-T104 aprovaram o replay puro, a ponte evento+replay, a copy segura e a UI local. Persistencia de ledger, save v6, Worker/SQLite e consequencias terminais oficiais continuam fora do escopo e exigem um gate separado.

## Condicoes Para Abrir A Primeira UI

- Replay de HP real definido como contrato puro e coberto por testes.
- Copy aprovada via `src/features/combat-encounter/model/combatRealDamagePreviewView.ts`, sempre dizendo `Previa local de HP real`, que nao salva a ficha e nao aplica Moribundo ou Inconsciente.
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
   - exibicao separada de `Previa local de HP real`;
   - ausencia de promessa visual de HP real persistido.
4. Salvar evidencias em `output/playwright/`.

## Evidencia De Validacao

- `npm.cmd run qa:vertical-slice`: aprovado.
- `npm.cmd run test:coverage`: 84 arquivos, 707 testes e 100% de cobertura.
- `npm.cmd run build`: aprovado.
- `npm.cmd run quality:gate`: aprovado.
- Browser do Codex em `http://localhost:5173/`: criacao de `Nara`, selecao no combate, ataque recebido, `HP de treino` e previa local em `9/15`, reset para estado indisponivel e ocultacao para `Aria`.
- Viewport estreito de 711 px: sem overflow horizontal, textos contidos e console sem erros ou avisos.
- A captura de screenshot do navegador interno excedeu o tempo; a evidencia foi confirmada por DOM renderizado, estado acessivel e verificacao de layout.

## Proxima Tarefa Recomendada

Criar um gate separado de persistencia para decidir save v6, Worker/SQLite, replay carregado do ledger e aplicacao oficial de estados terminais.
