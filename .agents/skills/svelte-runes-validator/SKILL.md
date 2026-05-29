---
name: "svelte-runes-validator"
description: "Validador estático de sintaxe Svelte 5 Runes. Detecta e impede o uso de padrões antigos do Svelte 4 (export let, reatividade $) e alucinações de imports em componentes .svelte sob o ambiente local Windows 11."
---

# 🛡️ Svelte 5 Runes Validator Skill

Esta skill aplica validações de sintaxe de forma estática para garantir que todos os componentes `.svelte` criados ou modificados no repositório Pandorha Engine sigam estritamente o padrão de **Runes do Svelte 5**.

Ela serve para mitigar erros comuns de alucinação de modelos LLM Flash (como o Gemini 3.5 Flash) que tendem a misturar APIs de versões anteriores do Svelte.

## 📋 Regras de Validação

O validador verifica as seguintes inconsistências e restrições:

1.  **`[svelte4-export-let]`** - O uso de `export let` para declarar propriedades (props) é proibido. Utilize `$props()` para desestruturação de propriedades no Svelte 5.
    *   *Errado:* `export let character;`
    *   *Correto:* `let { character } = $props();`
2.  **`[svelte4-reactive-label]`** - O uso de labels reativos `$: ` para dados derivados ou efeitos é proibido. Utilize `$derived(...)` para valores computados ou `$effect(...)` para efeitos colaterais de DOM.
    *   *Errado:* `$: doubleHP = hp * 2;`
    *   *Correto:* `let doubleHP = $derived(hp * 2);`
3.  **`[svelte-internal-import]`** - A importação de qualquer recurso de `'svelte/internal'` é estritamente proibida (geralmente gerada por alucinação). Utilize as APIs oficiais públicas do Svelte.
4.  **`[svelte-legacy-component-tag]`** - A tag especial `<svelte:component this={...}>` é depreciada. No Svelte 5, componentes dinâmicos podem ser instanciados usando diretamente sua variável em PascalCase (ex: `<SelectedPanel />`).

## 💻 Instruções de Execução no Windows 11

Como o projeto é executado localmente em ambiente Windows 11 puro, o validador é acionado usando scripts Node.js:

*   **Validar todo o diretório `src`:**
    ```powershell
    node scripts/validate_svelte_syntax.mjs src
    ```
*   **Validar arquivos específicos:**
    ```powershell
    node scripts/validate_svelte_syntax.mjs src/features/combat-encounter/ui/CombatEncounterPanel.svelte
    ```

Sempre execute este validador antes de registrar checkpoints de tarefa ou de finalizar pull requests.
