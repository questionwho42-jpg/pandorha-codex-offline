# ADR-015: Estratégia Avançada de Testes e Validações (Fase 2)

- **ID:** ADR-015
- **Status:** Aceito
- **Data:** 2026-06-10
- **Task Ledger:** ampliacao-testes-validacoes-fase2

## Contexto

À medida que o Pandorha Engine amadurece como um motor local-first e com reatividade rica baseada em Svelte 5 Runes, surgem desafios complexos de qualidade de software que testes unitários e de propriedades simples não cobrem:
1. **Reatividade de UI de Combate:** Garantir que transações de estado nos Runes (`$state`, `$derived`) atualizem corretamente os elementos da UI no DOM sem pagar o overhead de inicializar o navegador globalmente em todas as suítes matemáticas.
2. **Balanceamento e Regressões em Loops de Combate:** Assegurar que novas classes, talentos e inteligência tática não criem loops infinitos de reações ou falhas de balanceamento (ex: lutas impossíveis de vencer). Replicar as regras em scripts externos redundantes (como Python) gera fragilidade.
3. **Consistência, Concorrência e Performance de Banco de Dados:** O SQLite WASM com Drizzle no Worker RPC está exposto a escritas simultâneas concorrentes, falhas de transação parciais de rede/RPC e lentidão por falta de índices nas consultas.

## Decisão

Adotar uma arquitetura de testes avançados composta por quatro frentes de qualidade:

1. **Testes Híbridos de UI Reativa (Svelte 5):** Usar `// @vitest-environment happy-dom` pontualmente em arquivos de especificações de componentes (ex: `CombatEncounterPanel.spec.ts`) para isolar o ambiente de navegador simulado.
2. **Simulação Monte Carlo Parametrizada no Vitest:** Portar a simulação estatística para TypeScript importando os serviços reais de domínio (`CombatEncounterService`, `TacticalAiService`). Implementar o *Modo Arena* (combate único e limpo) e o *Modo Masmorra* (sobrevivência de campanha acumulada), exportando relatórios JSON/Markdown nos artefatos.
3. **Robustez Concorrente e Crash Recovery no SQLite:** Criar testes de estresse concorrente (`Promise.all` em 50 gravações simultâneas), rollback transacional atômico em caso de falha de conexão na barreira RPC, e validação de chaves estrangeiras com deleções em cascata.
4. **Auditoria Dupla de Otimização SQL (Explain Plan):** Interceptar queries SQL via logger customizado nos testes do Drizzle ORM e executar `EXPLAIN QUERY PLAN <query>` no banco de dados SQLite real (`sql.js`), falhando o teste se a instrução `SCAN TABLE` for detectada para as tabelas principais de domínio. Adicionalmente, ler estaticamente as migrations de banco via Regex em tempo de testes para assegurar a existência de chaves e índices declarados.
5. **Quality Gate Otimizado:** Atualizar `run_full_quality_gate.mjs` para parsear os arquivos de métricas gerados e barrar o commit caso haja loops infinitos, Table Scans ou latências que excedam os budgets definidos.

## Consequências

### Positivas:
- **Zero Hallucinated Rules:** A simulação usa o código TypeScript exato do jogo, eliminando regras duplicadas e defasadas em Python.
- **Prevenção Atômica contra Corrupção de Estado:** Rollbacks transacionais garantem consistência mesmo sob quedas simuladas de mensagens RPC.
- **Desempenho de Persistência Garantido:** A detecção automática de `SCAN TABLE` barra a ausência de índices nas consultas Drizzle antes do Pull Request.
- **Velocidade de Execução:** O ambiente `happy-dom` é restrito a arquivos de UI específicos, mantendo o restante da suíte ultraveloz sob `node`.

### Negativas:
- **Tempo de Execução:** A execução de 1.000 batalhas Monte Carlo adiciona alguns segundos à suite sob demanda (mitigado parametrizando o número de iterações no Vitest).
- **Complexidade nos Testes de Banco:** Simular falhas parciais de rede na barreira RPC requer mockar ou interceptar adequadamente o canal de mensagens assíncronas do repositório.
