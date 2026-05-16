# Planejamento: Suporte Offline PWA & Persistência Local-First Real

## 📋 Estado Atual do Projeto
* **Fase T37 e T38 (Nomenclatura unificada)**: Planejamento arquitetural consolidado no artefato `implementation_plan.md`.
* **Próximo Passo**: Aguardar a aprovação do usuário para iniciar a execução da Fase T37 (Service Worker Vanilla nativo) e posterior Fase T38 (Conexão física ao SQLite WASM).

## 🚀 Próximas Ações Imediatas após Aprovação:
1. **Fase T37 (PWA Offline Smoke)**:
   * Criar o Service Worker em `public/sw.js` com cache dinâmico de assets baseados em timestamps de compilação do Vite.
   * Modificar `App.svelte` para detectar o status `navigator.onLine` e exibir o indicador em Éter `#DAB973` e Bronze `#A87832`.
2. **Fase T38 (Persistência Local Real)**:
   * Mapear o Drizzle SQLite para salvar e carregar e conectar aos serviços reativos via RPC Worker.
3. **Fase T39 (QA & Validação)**:
   * Executar build, testes com 100% de cobertura e auditoria completa do banco local.
