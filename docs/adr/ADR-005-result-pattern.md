# ADR-005: Result Pattern Obrigatório — Proibição de throw

- **ID:** ADR-005
- **Status:** Aceito
- **Data:** 2026-05-02
- **Task Ledger:** tracer-bullet-character-domain

## Contexto

Sistemas de RPG têm inúmeros casos de falha previsível: dados inválidos, recursos insuficientes, ações proibidas pelo estado atual (ex.: conjurar magia sem EE suficiente). Em TypeScript, o tratamento tradicional via `throw new Error()` tem limitações para este domínio:

1. Exceções não fazem parte da assinatura de tipo — o chamador pode esquecer de tratar
2. Exceções percorrem a call stack de forma imprevisível — dificulta o fluxo de combate sequencial
3. Na ActionQueue, uma exceção não tratada cancela toda a fila, não apenas o comando atual
4. Testes que dependem de `throw` precisam de `try/catch` — dificulta a leitura das specs

## Decisão

**Proibir `throw new Error()` para regras de negócio.** Toda função que pode falhar DEVE retornar `Result<Success, Failure>`.

**Implementação:**
```typescript
// src/shared/lib/result.ts
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const fail = <E>(error: E): Result<never, E> => ({ success: false, error });
```

**Regras de uso:**
- Todos os métodos de `*Service.ts` devem retornar `Result<T, ErrorType>`
- A UI checa `result.success` antes de acessar `result.data`
- Erros são strings ou objetos de erro tipados — nunca instâncias de `Error`
- `throw` é permitido apenas em situações de falha catastrófica irrecuperável (ex.: WASM não carregou)
- O Worker nunca dispara exceções para a Main Thread — falhas são `RPCResponse<T>` com `success: false`

**Localização:** `src/shared/lib/result.ts`

## Consequências

**Positivas:**
- Controle de fluxo explícito — o chamador é forçado a tratar o erro pelo compilador TypeScript
- Testabilidade: specs podem fazer `expect(result.success).toBe(false)` sem try/catch
- ActionQueue processa falhas de comando como dados, não como exceções que cancelam a fila
- Compatível com o pattern Railway Oriented Programming para chains de operações

**Negativas:**
- Mais verboso que `throw` para erros simples
- Desenvolvedores acostumados com exceções precisam adaptar o padrão mental
- Interoperabilidade com bibliotecas externas que lançam exceções requer wrappers

## Exemplos Corretos

```typescript
// ✅ CORRETO
class CharacterService {
  createCharacter(input: CreateCharacterInput): Result<Character, CharacterError> {
    const validation = characterSchema.safeParse(input);
    if (!validation.success) return fail({ type: 'VALIDATION_ERROR', issues: validation.error });
    return ok(this.repository.save(validation.data));
  }
}

// ❌ PROIBIDO
class CharacterService {
  createCharacter(input: unknown): Character {
    if (!isValid(input)) throw new Error('Invalid input'); // NUNCA
    return this.repository.save(input);
  }
}
```
