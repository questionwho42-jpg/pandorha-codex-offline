# PANDORHA ENGINE - MASTER AGENT CONTEXT (AGENTS.md)

Este arquivo define as diretrizes inegociáveis para qualquer agente de IA operando no repositório Pandorha Engine. Ele deve ser lido INTEGRALMENTE antes de qualquer modificação no código.

## 🛠 Stack Tecnológica (The Source of Truth)
- **Runtime:** Node.js
- **Linguagem:** TypeScript (Modo Estrito: `strict: true`, no `any`)
- **ORM:** Drizzle ORM
- **Validação:** Zod (Schemas Zod são a única fonte de verdade para tipos e validação de dados)
- **Banco de Dados:** Local-First via SQLite WASM (Sincronização reativa)

## 🏗 Arquitetura: Feature-Sliced Design (FSD)
O projeto segue o padrão FSD para garantir escalabilidade e desacoplamento.
- **Isolamento:** Nenhuma importação pode cruzar fatias (slices) ou camadas (layers) de forma ilegal.
- **Camadas Permitidas:** `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`.
- **Regra de Ouro:** Se um módulo precisa de algo de outro módulo vizinho, isso deve ser extraído para uma camada inferior (Shared ou Entities).

## 🧪 Testes e Qualidade (TDD Estrito)
- **Cobertura:** 100% de cobertura exigida em todos os **Serviços** e **Domain Logic**.
- **Reverse TDD:** Sempre escreva o teste que falha ANTES de implementar a lógica.
- **Fakes vs Mocks:** Proibido o uso de `jest.mock()` ou mocks parciais. Utilize **Fakes em Memória** (Ex: `InMemoryRepository`) para testes de unidade e integração.

## ⚠️ Tratamento de Erros: Result Pattern
É terminantemente **PROIBIDO** o uso de `throw new Error()`.
- **Implementação:** Utilize o padrão `Result<Success, Failure>` (ou `Either`).
- **Rigor:** Todas as funções que podem falhar devem retornar explicitamente um objeto de erro tipado, forçando o chamador a tratar o caso de falha.

## 🎭 Padrões de Design Obrigatórios
- **DECORATOR:** Para todas as mecânicas de jogo (bônus de atributos, modificadores de dano, efeitos de status).
  - *Manifesto:* Prefira composição sobre herança. "Envolva" o componente base para adicionar comportamentos.

## 💻 Protocolo de Execução (Comandos Fixos)
Ao trabalhar no projeto, o agente DEVE validar seu trabalho com:
1. **Validar Lógica:** `npm test`
2. **Validar Estilo:** `npm run lint` (Biome/ESLint)
3. **Check-out de Tarefa:** Ao finalizar qualquer modificação, rode obrigatoriamente o script de automação:
   ```bash
   python scripts/pandorha_process_automation.py
   ```

---
*Este documento é a âncora de contexto para a IA. Não o ignore.*
