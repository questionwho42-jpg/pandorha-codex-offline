# Modo Offline Inicial

Este guia explica como testar o primeiro suporte offline do Pandorha Engine.

## O Que Funciona

- O app registra um service worker no navegador.
- O cabeçalho mostra o status `Offline disponível neste navegador.` quando a preparação termina.
- A interface básica pode ser carregada a partir do cache após o primeiro acesso bem-sucedido.

## Como Testar

1. Abra `http://127.0.0.1:5173/`.
2. Aguarde o cabeçalho mostrar `Offline disponível neste navegador.`.
3. Mantenha a página aberta por alguns segundos para o navegador cachear os arquivos principais.
4. Em uma validação manual do navegador, simule modo offline e recarregue a página.
5. Confirme que a interface principal ainda aparece.

## Limitações Atuais

- Este é um smoke test de PWA, não o modo offline final.
- Ainda não há tela de atualização de cache.
- Ainda não há manifest com ícones instaláveis.
- O save local continua sendo responsabilidade do SQLite WASM com OPFS e Worker.
- A automação completa de rede offline fica para a QA vertical da T40.
