# 🔮 LOCAL RULES: MAGIC MODULE

## 1. Nomenclatura e Estrutura
- **Serviços:** `SpellEngine.ts` (Casting logic), `ManaManager.ts`.
- **Módulos:** `MetamagicProcessor.ts`, `RitualEngine.ts`.
- **Componentes (Svelte):** `Spellbook.svelte`, `ManaBar.svelte`, `CastingOverlay.svelte`.
- **Tipos:** `SpellTypes.d.ts`.

## 2. Pub/Sub & Eventos
- **Escuta (Listeners):**
  - `CAST_SPELL`: Inicia a validação de custo e componentes.
  - `LEARN_SPELL`: Adiciona magia ao grimório do ator.
- **Emite (Emitters):**
  - `EE_CONSUMED`: Atualiza o banco de dados com o novo gasto de Energia Etérica.
  - `SPELL_FAILED`: Quando falha por falta de componentes ou interrupção.
  - `MAGIC_SURGE`: Gatilho para tabelas de caos.

## 3. Referências Obrigatórias ao GDD
- **Core:** [12-00-codex-de-magia.md](file:///c:/Users/Pichau/Desktop/pandorha%20sistema%2028-04/docs/system/magic/12-00-codex-de-magia.md)
- **Metamagias:** [12-metamagias-as-40-quebras.md](file:///c:/Users/Pichau/Desktop/pandorha%20sistema%2028-04/docs/system/magic/12-metamagias-as-40-quebras.md)

## 4. Restrições Técnicas
- **Integridade de Mana:** O `ManaManager` é o único que pode debitar EE.
- **Componentes:** Validar `V, S, M` antes de resolver o efeito da magia.
