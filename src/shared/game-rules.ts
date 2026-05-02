/**
 * PANDORHA ENGINE: GLOBAL SOURCE OF TRUTH
 * Este arquivo centraliza todas as constantes matemáticas extraídas do Game Design Document (GDD).
 * NENHUM NÚMERO "MÁGICO" DEVE EXISTIR NO CÓDIGO DA UI. IMPORTAR ESTAS VARIÁVEIS.
 */

export const PANDORHA_RULES = {
  CHARACTER_CREATION: {
    /**
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 2 (Passo 1)
     */
    POINTS_EIXOS: 6,
    /**
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 2 (Passo 2)
     */
    POINTS_APLICACOES: 6,
    /**
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 2 (Passo 1)
     */
    MIN_STARTING_AXIS: 1,
    /**
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 2 (Passo 1)
     */
    MAX_STARTING_AXIS: 3,

    TIER_CAPS: {
      /** @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 2 (Caps) */
      TIER_1: 3,
      /** @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 2 (Caps) */
      TIER_2: 4,
      /** @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 2 (Caps) */
      TIER_3: 5,
      /** @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 2 (Caps) */
      TIER_4: 6,
    }
  },

  UNIVERSAL_TESTS: {
    /**
     * Dificuldade (DC) base para testes passivos.
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 3 (Regras de Ouro)
     */
    BASE_DC: 10,
    /**
     * Valor que deve superar a DC para ser um Sucesso Crítico.
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 3 (Graus de Sucesso)
     */
    CRITICAL_MARGIN: 10,
    /**
     * Se o resultado for menor que a DC por até este valor, o Mestre oferece um Sucesso com Custo.
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 3 (Graus de Sucesso)
     */
    SUCCESS_WITH_COST_MARGIN: 4,
    /**
     * Se a falha for por este valor ou mais, é uma Falha Crítica / Total.
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 3 (Graus de Sucesso)
     */
    CRITICAL_FAIL_MARGIN: 5,
  },

  COMBAT: {
    /**
     * Classe de Armadura Base antes de somar nível e atributos.
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 4
     */
    BASE_CA: 10,
    /**
     * Pontos de ação base por turno.
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 5
     */
    BASE_ACTIONS: 3,
    /**
     * Limite absoluto de ações por turno (mesmo com buffs).
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 5
     */
    MAX_ACTIONS_HARD_CAP: 4,
    /**
     * Penalidade para o 2º ataque no turno.
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 5
     */
    MAP_PENALTY_1: -5,
    /**
     * Penalidade para o 3º ataque (ou posteriores) no turno.
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 5
     */
    MAP_PENALTY_2: -10,
  },

  DEATH: {
    /**
     * Dificuldade base do Teste de Estabilização.
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 5 (0 HP)
     */
    DEATH_DC_BASE: 10,
    /**
     * Número de sucessos necessários para estabilizar.
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 5 (0 HP)
     */
    DEATH_SUCCESSES_NEEDED: 3,
    /**
     * Número de falhas que resulta em morte do herói.
     * @source docs/system/survival/00-mecanicas-fundamentais.md - Seção 5 (0 HP)
     */
    DEATH_FAILURES_NEEDED: 3,
  },

  LOGISTICS: {
    /**
     * Valor somado a Físico + Resistência para definir a carga máxima.
     * @source docs/system/survival/regras-peso-carga.md - Seção 1
     */
    BASE_SLOTS_ADDITION: 6,
    /**
     * Ultrapassar o limite em mais de X slots inflige Imobilizado.
     * @source docs/system/survival/regras-peso-carga.md - Seção 1
     */
    OVERLOAD_IMMOBILIZED_THRESHOLD: 5,
    /**
     * Ultrapassar o limite de carga inflige redução de movimento neste valor.
     * @source docs/system/survival/regras-peso-carga.md - Seção 1
     */
    SLOWED_PENALTY_METERS: -3,
    /**
     * Capacidade máxima de poções dentro de um cinto de 1 Slot.
     * @source docs/system/survival/regras-peso-carga.md - Seção 2
     */
    POTION_BELT_CAPACITY: 5,
  }

} as const;

export type PandorhaRulesType = typeof PANDORHA_RULES;
