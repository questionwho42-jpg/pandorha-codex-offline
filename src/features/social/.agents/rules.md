# 🎭 LOCAL RULES: SOCIAL MODULE

## 1. Nomenclatura e Estrutura
- **Serviços:** `DialogueService.ts`, `ReputationManager.ts`.
- **Lógica:** `DispositionCalculator.ts`, `TradeEngine.ts`.
- **Componentes (Svelte):** `DialogueWindow.svelte`, `ChoiceButton.svelte`, `FactionStandings.svelte`.

## 2. Pub/Sub & Eventos
- **Escuta (Listeners):**
  - `START_DIALOGUE`: Carrega árvore de nós do banco.
  - `SELECT_OPTION`: Resolve consequências e gatilhos.
- **Emite (Emitters):**
  - `REPUTATION_CHANGED`: Atualiza `faction_standing` no SQLite.
  - `ITEM_TRADED`: Sincroniza com o módulo de Inventário.
  - `MENTAL_HP_LOSS`: Dano sofrido em debates ou falhas sociais.

## 3. Referências Obrigatórias ao GDD
- **Social:** [regras-completas-interacoes-sociais.md](file:///c:/Users/Pichau/Desktop/pandorha%20sistema%2028-04/docs/system/survival/regras-completas-interacoes-sociais.md)
- **Negociação:** [regras-negociacao.md](file:///c:/Users/Pichau/Desktop/pandorha%20sistema%2028-04/docs/system/survival/regras-negociacao.md)

## 4. Restrições Técnicas
- **Requisitos:** Sempre validar atributos e flags (`world_state`) antes de exibir uma opção de diálogo.
- **Persistência:** Decisões críticas devem salvar `flags` permanentes imediatamente.
