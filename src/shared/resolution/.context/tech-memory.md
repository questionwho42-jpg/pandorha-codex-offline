# Resolution Technical Memory

## 2026-05-05 - T19 ResolutionService

- Created `shared/resolution` as the pure core for Pandorha Global Tests.
- `ResolutionService` consumes `DiceService.rollD20` instead of rolling directly.
- The implemented formula is `d20 + level + axisValue + applicationValue + itemBonus`.
- `docs/system/` precedence resolved the natural 20 conflict: 20 natural guarantees at least `success`, but `criticalSuccess` still requires margin `+10`.
- Natural 1 forces `failure` even when modifiers would otherwise reach DC.
- Damage, spell effects, opposed checks, advantage/disadvantage, ActionQueue, UI, and persistence are deferred.
