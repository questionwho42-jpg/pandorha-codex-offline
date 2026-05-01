# PROJETO: PANDORHA DIGITAL ENGINE
> **Status:** Arquitetura de Software Consolidada (v1.0)
> **Stack Base:** Svelte 5+ / TypeScript / SQLite WASM / Drizzle ORM

---

## 1. Fundação Tecnológica e Persistência
- **Frontend Framework:** Svelte 5+ (Tipagem estrita via TypeScript).
- **Gerenciamento de Estado UI:** Paradigma de reatividade moderna via Svelte Runes (`$state`, `$derived`, `$effect`).
- **Banco de Dados (A Fonte da Verdade):** SQLite compilado para WebAssembly (WASM).
- **Data Access Layer:** Drizzle ORM para queries 100% tipadas end-to-end.
- **Armazenamento Físico (Save Game):** OPFS (Origin Private File System) executado em Web Worker dedicado para I/O de altíssima performance.
- **Distribuição de Assets:** PWA (Progressive Web App) com Service Workers (Cache API) garantindo que o jogo, as artes e os sons funcionem 100% offline após o primeiro carregamento.

## 2. Padrões de Engenharia de Código
- **Estrutura do Repositório:** Feature-Based / Domain-Driven (ex: `src/features/combat/`, `src/features/magic/`). Cada funcionalidade encapsula seus componentes, serviços e esquemas.
- **Injeção de Dependência:** Manual por Construtor (Pure DI) instanciada na raiz e distribuída via `Context API` do Svelte para facilitar a criação de Mocks nos testes.
- **Padrão de Comunicação (Main-to-Worker):** RPC Transparente usando a biblioteca `Comlink`, eliminando a complexidade do `postMessage` bruto.
- **Sincronização de Estado:** Imperativa (Service-Driven). A lógica executa a gravação no SQLite via Drizzle e, na mesma função, atualiza as variáveis reativas do Svelte correspondentes.
- **Tratamento de Erros:** Padrão Result/Monads. Funções retornam objetos `{ success: boolean, data?: T, error?: string }` para garantir que exceções sejam tratadas explicitamente.
- **Validação de Runtime:** `Zod`. Todo JSON de entidade (Bestiário, Magias) deve ser inspecionado pelo Zod antes de ser instanciado, prevenindo falhas silenciosas de integridade.
- **Migração de Dados (Save Upgrades):** Migrações nativas do Drizzle ORM executadas durante o *bootstrapping* inicial para proteger saves antigos contra mudanças de esquema.

## 3. Comportamento do Motor e Interface
- **Roteamento (View Management):** Router Customizado State-Driven (sem manipulação de URLs). Telas navegam através da troca de variáveis `$state`, bloqueando *save scumming* via navegador.
- **Tempo e Sequenciamento:** Fila de Apresentação Desacoplada (Presentation Event Queue). Cálculos no backend são resolvidos instantaneamente; o Log de combate processa eventos na UI com delays programados.
- **Internacionalização (i18n):** Abordagem Híbrida. Textos de UI vivem em arquivos JSON estáticos (alta velocidade); *Lore* e descrições do Compêndio vivem em colunas no SQLite (buscas dinâmicas).
- **Gerenciamento de DOM (Log):** Auto-Trimming. O histórico visual no Svelte mantém no máximo 100 nós, destruindo os mais antigos para poupar RAM. O histórico completo vive seguro no SQLite.
- **Observabilidade (Logs):** `LoggerService` persistente no SQLite para rastreamento de erros lógicos, com buffer circular de emergência no `localStorage` em caso de falha crítica do VFS.

## 4. Núcleo Matemático de Pandorha
- **Cálculo de Atributos/Modificadores:** Dinâmico On-The-Fly. Os modificadores ativos não são gravados no banco de dados como valores finais absolutos; o motor recalcula o total a cada interação utilizando o `$derived` do Svelte para evitar estados fantasmas.
- **Sistema de Rolagens (RNG):** `DiceService` centralizado. Nenhuma parte do código usa `Math.random()` diretamente. Toda rolagem passa pela classe de Serviço para gerar um log de "Auditoria de Dados" guardado no banco.
- **Estratégia de QA (Testes):** TDD focado exclusivamente na Camada de Serviços. Cobertura de 100% exigida via `Vitest` para regras de negócio (dano, carga, condições, metamagia). A camada visual (Svelte) não terá testes E2E ou de DOM automatizados.