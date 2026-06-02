# Prompt Inicial Para Novas Features

"Codex, inicie o trabalho na tarefa: [NOME DA TAREFA].

PARADA OBRIGATÓRIA - NÃO ESCREVA CÓDIGO AINDA. Siga este protocolo de inicialização passo a passo:

Leia o arquivo AGENTS.md na raiz para carregar as regras globais e stack (Node, TypeScript, Drizzle, SQLite, FSD).

Use a skill/MCP pandorha-knowledge para buscar as regras de negócio, lore e convenções arquiteturais relevantes para esta tarefa nas pastas /docs e /lore.

Use a skill/MCP pandorha-arch-guard para validar em qual camada do Feature-Sliced Design você planeja inserir os novos módulos.

Apresente-me um Plano de Implementação detalhado contendo:

Quais arquivos serão criados/modificados.

A estrutura do Drizzle/Zod proposta (se houver banco de dados).

O plano de TDD (quais testes e Fakes serão criados para atingir 100% de cobertura nos Serviços).

Entendido? Aguarde minha aprovação explícita antes de gerar qualquer linha de código-fonte."
