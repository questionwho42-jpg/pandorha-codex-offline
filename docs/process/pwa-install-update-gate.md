# Gate De Instalacao E Atualizacao PWA

## Objetivo

Este gate aprova a fatia minima para tornar o app instalavel como PWA e expor
um controle seguro de atualizacao quando houver service worker novo aguardando
ativacao.

Esta fase nao altera regras de RPG, save, SQLite, inventario, combate, HP real
ou `docs/system/`.

## Fontes Revisadas

- Registro offline atual: `src/app/model/pwaOfflineRegistration.ts`.
- Status offline atual: `src/app/model/pwaStatusView.ts`.
- Service worker atual: `public/pandorha-sw.js`.
- Guia de usuario offline: `docs/user/offline-smoke.md`.
- Entrada de acompanhamento: `20260606-future-pwa-update-install-ui`.

## Contrato Aprovado

A implementacao deve:

- adicionar `public/manifest.webmanifest` e linkar o manifest em `index.html`;
- reutilizar asset local para icone, sem baixar imagem externa;
- manter o service worker existente como base;
- mostrar `Instalar app` apenas apos evento `beforeinstallprompt`;
- chamar `prompt()` somente por acao explicita do usuario;
- mostrar `Atualizacao disponivel` apenas quando houver worker em `waiting`;
- enviar mensagem `SKIP_WAITING` ao worker aguardando;
- recarregar a pagina apenas apos `controllerchange`;
- representar falhas com estados tipados e copy pt-BR.

## Estados De UI

Instalacao:

- `unavailable`: nao exibe botao de instalar;
- `available`: exibe `Instalar app`;
- `installing`: desabilita o botao enquanto o prompt abre;
- `accepted`: informa que o app foi instalado ou aceito;
- `dismissed`: informa que a instalacao foi dispensada;
- `failed`: informa falha sem expor detalhes internos.

Atualizacao:

- `idle`: nao exibe controle de atualizacao;
- `available`: exibe `Atualizacao disponivel` e `Atualizar agora`;
- `applying`: desabilita o botao enquanto envia `SKIP_WAITING`;
- `failed`: informa que nao foi possivel aplicar a atualizacao.

## Fora Do Escopo

- Push notifications;
- background sync;
- cloud sync;
- analytics;
- nova dependencia;
- cache agressivo de dados do jogo;
- alterar save/load ou OPFS;
- alterar regras de RPG;
- alterar `docs/system/`.

## Gates Obrigatorios

- TDD para view/model de instalacao e atualizacao;
- `npm.cmd run qa:ui-reachability`;
- `npm.cmd run qa:vertical-slice`;
- `npm.cmd run docs:audit`;
- Browser do Codex confirmando status offline, manifest sem 404, simulacao de
  `beforeinstallprompt`, ausencia de erros no console e nenhuma regressao nas
  nove abas.
