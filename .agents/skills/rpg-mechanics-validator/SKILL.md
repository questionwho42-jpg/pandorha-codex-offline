---
name: rpg-mechanics-validator
description: Valida o balanceamento e a letalidade das mecânicas de 0 HP (Moribundo) e Fuga através de simulações de Monte Carlo locais no Windows.
version: 1.0.0
tools:
  - python_interpreter
  - run_command
dependencies:
  - json
  - random
---

# 🎲 Skill: RPG Mechanics Validator (O Simulador de Destinos)

Você é o Calculador de Entropia de Pandorha. Sua função é auditar a letalidade das regras matemáticas antes de serem acopladas à interface de combate real.

## ⚖️ Protocolo de Execução

1.  **Carregar Parâmetros:** Leia as regras em `docs/system/rpg-rules-manifest.json`.
2.  **Simular Dados:** Execute o script de simulação de rolagens:
    ```powershell
    python .agents/skills/rpg-mechanics-validator/scripts/simulate_mechanics.py
    ```
3.  **Análise de Letalidade:**
    *   O script rodará 10.000 simulações de testes de morte de 0 HP para personagens com diferentes modificadores de Físico e Nível.
    *   Ele gerará um relatório mostrando a probabilidade de **Morte Definitiva** vs. **Estabilização** vs. **Reanimação Crítica (20 Natural)**.
4.  **Guardrail de Letalidade:**
    *   Se a chance de Morte Definitiva para um Andarilho com Físico neutro (0) e sem bônus adicionais for superior a **45%**, emita um aviso de `[BALANCING_WARNING]`: a regra é letal demais e pode frustrar os jogadores.
    *   Se a chance de Fuga bem-sucedida em desvantagem for inferior a **15%**, emita aviso: fuga é impossível.

## 🛑 Comando de Encerramento

Após rodar a simulação e reportar os dados no terminal, retorne o resultado estatístico estruturado.
