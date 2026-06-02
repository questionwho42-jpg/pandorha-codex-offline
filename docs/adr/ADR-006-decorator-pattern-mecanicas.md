# ADR-006: Decorator Pattern para Mecânicas de Jogo

- **ID:** ADR-006
- **Status:** Aceito
- **Data:** 2026-05-10
- **Task Ledger:** Fase 7 (Status Effects), Fase 17 (Bastion recoveryDecorators), Fase 9 (CraftingDamageDecorators)

## Contexto

Mecânicas de RPG são composicionais por natureza: um personagem pode ter múltiplos efeitos de status, bônus de equipamento, buffs de magia e penalidades de condição ativos simultaneamente. A abordagem ingênua seria acumular todos esses modificadores em uma entidade `Character` com muitas propriedades opcionais — o chamado "God Object".

**Problemas do God Object para mecânicas de RPG:**
1. Verificar `if (character.hasEterFever && character.hasPoisonStack && character.isBloodMarked)` escala quadraticamente
2. Adicionar nova mecânica requer modificar `Character` e todos os services que o usam
3. Dificuldade de testar combinações de efeitos isoladamente
4. Viola o princípio Open/Closed — toda nova mecânica abre a classe existente

## Decisão

Usar o **Decorator Pattern** para todas as mecânicas de modificação de comportamento de entidades.

**Definição:** Um Decorator envolve uma entidade/service base e intercepta chamadas específicas para aplicar o modificador, delegando o resto para o objeto envolvido.

**Aplicações implementadas:**

### Status Effects (src/entities/character/domain/StatusEffectDecorator.ts)
```typescript
// Exemplo conceitual
class EterFeverDecorator implements CharacterStats {
  constructor(private inner: CharacterStats) {}
  
  get maxEE(): number {
    return Math.floor(this.inner.maxEE * 0.5); // EterFever reduz EE máximo
  }
  get hp(): number { return this.inner.hp; } // passa adiante
}
```

**Decorators de Status Implementados:**
- `EterFeverDecorator` — reduz EE máximo
- `WoundInfectionDecorator` — penalidade progressiva de HP por turno
- `ViperPoisonDecorator` — redução de atributos físicos

### Recovery Decorators (src/features/camp/domain/recoveryDecorators.ts)
Modificam a quantidade de HP/EE recuperada durante descanso de acampamento com base em condições (ex.: Vigília ativa reduz qualidade do sono).

### Damage Decorators (src/features/combat-encounter/domain/CraftingDamageDecorators.ts)
Modificam o pipeline de dano de acordo com propriedades de runas/encantamentos nos itens (ex.: runa de fogo adiciona dano elemental).

## Regras de Aplicação

1. **Composição em vez de herança:** Decorators implementam a mesma interface da entidade base, nunca estendem classes
2. **Ordem importa:** Decorators são aplicados de fora para dentro — o último a ser aplicado é o primeiro a ser chamado
3. **Imutabilidade:** Decorators não modificam a entidade base; retornam valores modificados apenas durante a chamada
4. **Testabilidade:** Cada Decorator deve ser testado isoladamente com uma entidade base fake

## Consequências

**Positivas:**
- Adicionar nova mecânica = criar novo Decorator sem modificar o código existente
- Combinações de efeitos são naturalmente compostas: `new PoisonDecorator(new FeverDecorator(base))`
- Cada Decorator é testável de forma isolada com fakes mínimos
- Código de combate não precisa de `if (hasPoison) { ... } else if (hasFever) { ... }`

**Negativas:**
- Debug de comportamento composto pode ser confuso (qual Decorator alterou o valor?)
- Ordem de aplicação de Decorators precisa ser documentada e testada
- Criação de muitos Decorators pequenos pode fragmentar o código

## Onde NÃO usar Decorator

- Validação de entrada (usar Zod)
- Lógica de persistência (usar Repository pattern)
- Derivação de stats no-the-fly (usar `$derived` do Svelte 5)
- Composição de queries (usar Drizzle diretamente)
