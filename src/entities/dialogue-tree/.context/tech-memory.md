# DialogueTree Tech Memory

- T54 criou a primeira árvore de diálogo read-only para `training-broker`.
- A entidade mantém `dialogue_nodes` e `dialogue_options` como contratos Drizzle-Zod, mas sem migration real nesta fase.
- As opções apontam para `DialogueChoice` por `choiceId` técnico; a validação cruzada fica em testes para evitar importação obrigatória entre entidades irmãs no runtime.
- A árvore prepara o argumento social; ela ainda não executa resolução, consequência ou save próprio.
