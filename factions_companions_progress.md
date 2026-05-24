# Progresso e Próximos Passos: Fases 21 e 22

Este arquivo registra o andamento atual do desenvolvimento das Fases 21 e 22 (Facções e Companheiros Místicos) e os próximos passos de engenharia.

---

## 🛠️ Estado Atual (Progresso)
* **Modelagem e Banco de Dados (Tarefa 1 & 4):**
  * Criado o novo schema em `companionSchema.ts` para persistência das criaturas e familiares.
  * Ampliado o schema `socialSchema.ts` para incluir a tabela `campaign_social_ledger` (gerenciamento de Fama XP, Nível e Favores).
  * Injetados os novos schemas no arquivo de configuração global `drizzle.config.mjs`.
  * Gerada a migração de banco `0012_reflective_sasquatch.sql` com sucesso.
  * Registrada a migração em `sqliteMigrations.ts` para execução no bootstrap OPFS do Web Worker.
  * Realizado o commit local atômico e criada a branch `task/factions-companions` de desenvolvimento.

---

## 📅 Próximas Etapas

### 🏛️ Fase 21: Sistema de Fama, Dívida de Sangue e Favor de Facções
* **Tarefa 2 (Lógica & TDD):**
  * Definir a interface `FactionRepository` e sua implementação em memória `InMemoryFactionRepository`.
  * Implementar o `FactionService` sob regras de Dívida de Sangue (e bloqueios de descansos no acampamento) e Favores.
  * Escrever testes em `FactionService.spec.ts` com 100% de cobertura.
* **Tarefa 3 (RPC & UI):**
  * Integrar rotas RPC e ponte no Web Worker.
  * Atualizar o `FactionPanel.svelte` para exibição reativa.

### 🐾 Fase 22: Sistema de Companheiros e Familiares Místicos
* **Tarefa 5 (Lógica & TDD):**
  * Definir a interface `CompanionRepository` e sua implementação `InMemoryCompanionRepository`.
  * Implementar o `CompanionService` sob regras de Invocação, Partilha de Sentidos (com dano mental recíproco) e bônus de exploração.
  * Escrever testes em `CompanionService.spec.ts` com 100% de cobertura.
* **Tarefa 6 (RPC & UI):**
  * Integrar rotas RPC e atualizar `CharacterCard.svelte` para renderizar o elo.
