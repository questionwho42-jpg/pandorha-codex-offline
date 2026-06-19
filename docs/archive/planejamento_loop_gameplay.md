> [!WARNING]
> **ARQUIVO ARQUIVADO** — Este planejamento foi concluído. As Fases 21–26 (Fações, Companions, Sinergias, Diálogos, Hexcrawl Encontro) estão registradas no `docs/process/task-ledger.md` e promovidas no `docs/changelog.md`. Este arquivo é mantido apenas como referência histórica. Data de arquivamento: 2026-05-31

# Estado Atual e Próximos Passos: Integração do Loop de Gameplay Real

## 📋 Estado Técnico Atual
* **Suíte de Testes:** 537 testes passando com 100% de sucesso absoluto (`npm test` verde).
* **Fases 21 e 22 (Fações e Companheiros Místicos):** Concluídas, validadas e commitadas no Git local com sucesso.
* **Git status:** Branch `task/factions-companions` limpa, sem arquivos pendentes para commit.
* **Alerta de Qualidade:** O script `quality:gate` acusou falhas de cobertura pendentes e violações de convenções de estilo (tags `<style>` locais e cores Tailwind padrão) nos painéis recém-criados.
* **Artefato de Planejamento:** Atualizado o arquivo [implementation_plan.md](file:///C:/Users/Pichau/.gemini/antigravity/brain/4428a785-f42c-4c1f-ab22-1c96e2a209b8/implementation_plan.md) detalhando as correções e as etapas do loop de jogo integrado.

---

## 📅 Próximos Passos (Aguardando Aprovação do Usuário)
1. **Aprovação do Plano:** O usuário deve ler e aprovar o `implementation_plan.md` com a nova Etapa 0 de estabilização.
2. **Etapa 0 (Estabilização de Qualidade):**
   * Criar a branch `task/quality-gate-stabilization`.
   * Registrar a cobertura dos 7 novos arquivos de serviço em `vitest.config.mjs` e expandir testes unitários se necessário.
   * Remover tags `<style>` locais dos painéis de UI (Bastião e Quests).
   * Refatorar as cores Tailwind padrão nos painéis de UI (Diálogos, Hexcrawl, Saves) para usarem tons da paleta de Pandorha.
   * Rodar o gate total `npm run quality:gate` até ficar totalmente verde.
3. **Etapa 1 (Integração de Encontros de Hex no Hexcrawl):**
   * Ajustar o `HexcrawlMovementService` para disparar monstros gerados pelo `MonsterFactory`.
   * Integrar a UI do mapa para abrir a tela de combate ao encontrar perigo.
4. **Etapa 2 (Combate Tático Real):**
   * Configurar o `CombatEncounterService` com a lista real de Andarilhos ativos e monstros do encontro.
   * Implementar a ordenação de Iniciativa (fila de turnos) e a IA básica dos inimigos.
5. **Etapa 3 (IA Inimiga e Recompensas):**
   * Criar o `CombatLootService` para injetar XP e itens físicos coletados após vitórias.
6. **Etapa 4 (Validação Visual Integrada da UI):**
   * Adaptar os componentes Svelte 5 para refletir o combate real e as mudanças de estado dos personagens.
