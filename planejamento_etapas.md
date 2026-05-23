# Continuidade: Planejamento das Próximas Etapas

## Estado Técnico Atual
* **Suíte de Testes**: 489 testes de unidade e integração passando com sucesso absoluto (`npm test` verde).
* **Fases 13 e 14**: Persistência de Clocks no SQLite OPFS, PWA offline com Service Worker e exportação/importação de Saves físicos em JSON já codificados na UI e no Worker, porém não commitados (arquivos no status de *untracked* ou *modified* no Git).
* **Bastião e Fações**: Persistência física do Bastião e Fações Sociais integradas no SQLite local e com testes de domínio completos.

## Próximos Passos (Aguardando Aprovação do Usuário)
1. **Fase 15 (Consolidação)**:
   * Criar os commits convencionais das implementações locais prontas de Bastião, Clocks, Saves e Factions no Git local.
   * Executar auditorias estritas de linting e validação com os scripts do Pandorha.
2. **Fase 16 (Sistema de Diálogos e Investigação)**:
   * Implementar o model e schema de diálogos e pistas em `campaign_dialogue_states`.
   * Desenvolver o `DialogueService` (AST de ramificações narratives que consome HP Mental, avalia atitude e manipula o `WorldState`).
   * Adicionar a interface interativa `DialoguePanel.svelte` e integrá-la à navegação para testes no navegador.
