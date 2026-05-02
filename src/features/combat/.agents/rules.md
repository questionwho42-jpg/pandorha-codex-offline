# ⚔️ LOCAL RULES: COMBAT MODULE

## 1. Nomenclatura e Estrutura
- **Serviços:** `CombatService.ts` (Core logic), `ActionProcessor.ts`.
- **Cálculos:** `DamageCalculator.ts`, `AccuracyMath.ts`.
- **Componentes (Svelte):** `BattleGrid.svelte`, `ActorToken.svelte`, `CombatLog.svelte`.
- **Tipos:** `CombatTypes.d.ts`.

## 2. Pub/Sub & Eventos
- **Escuta (Listeners):**
  - `REQUEST_ATTACK`: Inicia o fluxo de rolagem.
  - `USE_ABILITY`: Ativa poderes especiais.
- **Emite (Emitters):**
  - `ATTACK_ROLLED`: Resultado do d20 + modificadores.
  - `DAMAGE_DEALT`: Valor final após RD (Resistência a Dano).
  - `CONDITION_APPLIED`: Quando um status (ex: Sangrando) é colado ao ator.

## 3. Referências Obrigatórias ao GDD
- **Mecânicas:** [03-codex-de-combate-e-condicoes.md](file:///c:/Users/Pichau/Desktop/pandorha%20sistema%2028-04/docs/system/combat/03-codex-de-combate-e-condicoes.md)
- **Dano:** [18-tratado-de-dano.md](file:///c:/Users/Pichau/Desktop/pandorha%20sistema%2028-04/docs/system/combat/18-tratado-de-dano.md)

## 4. Restrições Técnicas
- **Sem Side-Effects:** Cálculos de dano devem ser funções puras.
- **Audit Log:** Toda rolagem de dado deve ser enviada para o `LoggerService` para persistência no SQLite.
