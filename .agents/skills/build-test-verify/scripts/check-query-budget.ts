/**
 * @description Auditor de Performance RPC para SQLite WASM.
 * Verifica se o número de queries disparadas está dentro do orçamento.
 */
export class QueryBudgetAuditor {
  private static budgets: Record<string, number> = {
    SAVE_COMBAT_TURN: 3,
    LOAD_HERO_DATA: 1,
    RESOLVE_DOWNTIME: 5,
  };

  static verify(operation: string, actualCount: number) {
    const limit = this.budgets[operation];
    if (limit && actualCount > limit) {
      throw new Error(
        `⚠️ OVER-BUDGET: Operação ${operation} fez ${actualCount} chamadas (Limite: ${limit}). Use Transações/Batching.`,
      );
    }
    return true;
  }
}
