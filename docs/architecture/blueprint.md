# DATA BLUEPRINT: PANDORHA ENGINE (v1.0)
> **Foco:** Esquemas de Dados e Integridade Referencial

---

## 1. Núcleo de Entidades (Actors)
- **Matriz 3x3:** Atributos armazenados como valores base (1-5).
  - *Eixos:* Físico, Mental, Social.
  - *Aplicações:* Conflito, Interação, Resistência.
- **Derivados Dinâmicos (Svelte Runes):** - `HP = (Base + Fis + Res) * Nv`
  - `EE = Nv + Mental` (ou conforme classe)
  - `CA = 10 + Nv + Eixo + Aplicação`

## 2. Logística e Inventário
- **Abordagem Híbrida:**
  - `equipment`: Instâncias únicas (ID, Durabilidade, Slots de Runa).
  - `consumables`: Registro por ID e Quantidade (Stacking).
- **Crafting por Essências:** Receitas validam `tags` de materiais (ex: [Fogo], [Éter]) em vez de nomes estritos.

## 3. Progressão e Poderes
- **Abilities & Spells:** Tabela unificada de metadados ligada a `EffectServices` (Scripts TypeScript).
- **Ancestralidade:** Relacionamento N:N entre `ancestries` e `traits`. Escolha de 3 traços no Nível 1.
- **XP Ledger:** Tabela de transações `xp_transactions`. O motor soma o histórico para definir o nível, validando o **XP Relativo** (Nv Inimigo vs Nv Grupo).

## 4. Sistemas de Mundo
- **Hexcrawl:** Tabela `world_tiles` com coordenadas Axiais (q, r). DC do hexágono derivada do `region_tier`.
- **Relógios:** Entidades `clocks` com fatias dinâmicas que disparam `event_triggers` ao completar.
- **Bastião:** Esquema de infraestrutura separado. Atributos da base + Tabela de `modules` ativos.

## 5. Tensão e Social
- **Teia de Infâmia:** Tabela `faction_standing` monitorizando `blood_debt` vs `fame * 3`.
- **Social:** Árvore de diálogos em `dialogue_nodes` e `dialogue_options` com requisitos de HP Mental.
- **Enfermidades:** Tabela `active_maladies` rastreando incubação e progresso de estágios.

## 6. Persistência Global
- **World State:** Tabela `world_state` (Key-Value Pair).
  - Ex: `set_flag("portao_aberto", 1)`, `get_flag("ouro_doado")`.
- **Interactables:** Registro unificado de objetos (Armadilhas, Baús) com DCs de Vigília e Ação.