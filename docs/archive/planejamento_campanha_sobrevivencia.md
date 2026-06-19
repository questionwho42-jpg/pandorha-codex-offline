> [!WARNING]
> **ARQUIVO ARQUIVADO** — Este planejamento foi concluído. As fases T40–T44 (Status Effects, Decorators, Bastion, Social, Companions) estão registradas no `docs/process/task-ledger.md` e promovidas no `docs/changelog.md`. Este arquivo é mantido apenas como referência histórica. Data de arquivamento: 2026-05-31

# Registro de Continuidade: Roteiro Pós-T39 (Sobrevivência & Campanha)

Este arquivo registra o estado do planejamento do Pandorha Engine após a validação completa de QA da vertical slice (Fase T39).

## Estado Atual
* **Fases T01 a T39 Concluídas:** A vertical slice inteira (Personagens, Compêndio, Inventário, Hexcrawl, Combate de Treino, Acampamento e Clocks) está totalmente implementada e homologada com SQLite local no OPFS via RPC e PWA Offline Service Worker.
* **100% de Cobertura & Linter Passando:** Validado e auditado contra regras estritas do projeto.
* **Plano de Campanha Criado:** Atualizamos o `implementation_plan.md` e o `task.md` detalhando as Fases T40 a T44 para tornar o Pandorha Engine um jogo de sobrevivência tática e gestão de bastião robusto.

## Próximos Passos (Aguardando Aprovação do Usuário)
1. **Aprovação do Plano de Implementação:** O usuário deve revisar o `implementation_plan.md` e nos dar o sinal verde.
2. **Início da Fase T40 (Enfermidades e Toxinas):** 
   * Criar branch `task/status-effects-decorations`.
   * Modelar schemas Drizzle para os efeitos de status negativos.
   * Desenvolver os modificadores de atributos do personagem usando o padrão **Decorator** (com a interface `ICharacterStats` e decoradores concretos `WoundInfectionDecorator` / `EterFeverDecorator` com efeito cebola).
   * Escrever os testes unitários via TDD.
   * Conectar ao Worker RPC e atualizar o formulário na UI.
