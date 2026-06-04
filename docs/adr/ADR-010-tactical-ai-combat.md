# ADR-010: Arquitetura de IA de Combate e Iniciativa Baseada em Comandos e Papéis Táticos

- **ID:** ADR-010
- **Status:** Aceito
- **Data:** 2026-06-04
- **Task Ledger:** N/A (Fase de Planejamento)

## Contexto

Com a integração do combate real no hexcrawl, precisamos decidir como estruturar o comportamento dos monstros de forma tática, flexível e alinhada às regras do motor. O motor possui uma `ActionQueue` centralizada (pilha LIFO para Reações/Interrupções e fila FIFO para Ações de turno). Além disso, a iniciativa deve ordenar os turnos dos personagens e monstros dinamicamente a cada rodada. Mapear a lógica da IA dentro dos modelos de entidade dos monstros (como classes ou arquivos de script individuais) pode gerar acoplamentos indesejados e circulares (por exemplo, as entidades necessitarem ler o estado global do combate e inventários para tomar decisões), violando as fronteiras de isolamento do Feature-Sliced Design (FSD).

## Decisão

Adotar a **Alternativa A (IA baseada em Estado e Papel Tático Reativo)**:

1. **Geração de Comandos Funcionais:** A tomada de decisão dos monstros será puramente baseada em dados e gerada por um serviço centralizado, o `TacticalAiService` (localizado em `src/features/combat-encounter/domain/`).
2. **Papel Tático (Tactical Role):** Os monstros possuem uma propriedade `tacticalRole` persistida no banco SQLite (tabelas `monsters` / `combat_monsters`). Os papéis padrão são `Bruto`, `Assino` (Assassino) e `Suporte`.
3. **Resolução de IA via ActionQueue:** Quando o turno de um monstro inicia, o `TacticalAiService` avalia o estado reativo do combate, seleciona as ações conforme o `tacticalRole` e o estado de saúde do monstro, e gera uma lista de comandos imutáveis (ex: `AttackCommand`, `MoveCommand`, `UseAbilityCommand`). Esses comandos são então enfileirados na `ActionQueue` de combate.
4. **Fila de Iniciativa:** A iniciativa de cada ator será calculada e enfileirada no início do combate (e opcionalmente reordenada em rodadas futuras), sendo persistida de forma síncrona no banco SQLite para garantir consistência e evitar perdas de estado no reload.

## Consequências

**Positivas:**
- **Desacoplamento de Domínio (FSD):** A camada inferior de `entities/monster` permanece como um repositório puro de dados e schemas, sem conhecer detalhes de execução do combate.
- **Testabilidade Absoluta:** O `TacticalAiService` pode ser testado por testes unitários deterministicos com 100% de cobertura, injetando fakes de combates e assinalando se os comandos corretos foram criados para a `ActionQueue`.
- **Manutenibilidade:** Novos monstros podem ser criados facilmente atribuindo um dos papéis táticos existentes e ajustando suas estatísticas e habilidades.

**Negativas:**
- **Complexidade de Mapeamento:** Exige que todas as mecânicas específicas de habilidades de monstros sejam modeladas como parâmetros e comandos que o serviço centralizado saiba ler e converter em instâncias de comando na `ActionQueue`.

## Alternativas Consideradas

| Opção | Prós | Contras |
|:---|:---|:---|
| **IA baseada em Estado (Escolhida)** | Alta testabilidade, desacoplamento no FSD, integrado com a ActionQueue. | Exige regras de conversão centralizadas para todas as habilidades de monstros. |
| **Scripts na Entidade** | Fácil de estender comportamentos exóticos por criatura de forma independente. | Alto acoplamento, dependências circulares ilegais entre camadas do FSD, difícil de testar. |
| **Decorators de Comando** | Segue de perto a preferência por composição via Decorator. | Adiciona alta complexidade de envelopamento de chamadas e opacidade na depuração da fila. |
