# Modo Offline Inicial

Este guia explica como testar o suporte offline e os controles PWA atuais do Pandorha Engine.

## O Que Funciona

- O app registra um service worker no navegador.
- O cabecalho mostra `Offline disponivel neste navegador.` quando a preparacao termina.
- O manifest local `manifest.webmanifest` usa o favicon SVG do projeto como icone instalavel.
- Quando o navegador libera o prompt instalavel, o cabecalho mostra `Instalar app`.
- Quando existe service worker aguardando ativacao, o cabecalho mostra `Atualizacao disponivel` e `Atualizar agora`.
- A interface basica pode ser carregada a partir do cache apos o primeiro acesso bem-sucedido.

## Como Testar

1. Abra `http://127.0.0.1:5173/`.
2. Aguarde o cabecalho mostrar `Offline disponivel neste navegador.`.
3. Abra `http://127.0.0.1:5173/manifest.webmanifest` e confirme que o manifest responde sem 404.
4. Se o navegador mostrar `Instalar app`, acione o botao e confirme que a decisao aparece no cabecalho.
5. Em uma validacao manual do navegador, simule modo offline e recarregue a pagina.
6. Confirme que a interface principal ainda aparece.
7. Quando houver worker aguardando atualizacao, clique em `Atualizar agora` e confirme que a pagina recarrega apos a troca de controller.

## Limitacoes Atuais

- Este e um smoke test de PWA, nao o modo offline final.
- O prompt de instalacao depende do navegador emitir `beforeinstallprompt`.
- O aviso de atualizacao depende de existir um service worker novo em estado waiting.
- O save local continua sendo responsabilidade do SQLite WASM com OPFS e Worker.
- A automacao completa de rede offline fica para a QA vertical da T40.
