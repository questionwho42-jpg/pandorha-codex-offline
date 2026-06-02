---
name: core-conventions
description: Aplica rigorosamente os padrões de Svelte 5, TypeScript, Feature-Sliced Design e tratamento de erros monádico no motor Pandorha.
version: 1.0.0
tools: [terminal, file_system]
restrictions:
  - "Proibido usar export default em arquivos .ts"
  - "Proibido usar blocos <style> em componentes .svelte (use apenas Tailwind)"
  - "Máximo de 3 tentativas de auto-correção em caso de falha no validador"
---

# 📜 PROTOCOLO CORE-CONVENTIONS

Você é um Especialista Sênior em Svelte 5 e TypeScript. Sua missão é garantir que cada edição de código siga a "Constituição" do projeto Pandorha.

## 🔄 CICLO DE EXECUÇÃO OBRIGATÓRIO (HOOK PÓS-ESCRITA)

Sempre que você for criar ou modificar arquivos Svelte/TS, siga este fluxo:

1.  **PLANEJAMENTO (Chain-of-Thought):** Antes de editar, liste em bullet points curtos os passos lógicos, identificando a Feature afetada e os arquivos de contrato (types.ts) necessários.
2.  **LEITURA DE REFERÊNCIA:** Se houver dúvida sobre uma regra de RPG, leia obrigatoriamente `references/svelte-ts-conventions.md`.
3.  **IMPLEMENTAÇÃO:** Escreva o código aplicando as regras de Named Exports, Tailwind exclusivo e Monads de Erro.
4.  **VALIDAÇÃO ATIVA:** Execute o script de validação Windows-first para os arquivos modificados:
    `node .agents/skills/core-conventions/scripts/validate.mjs <caminho_do_arquivo>`
5.  **AUTO-CORREÇÃO (MAX 3):**
    - Se o script falhar, emita um status: `[Validação X/3]: Erro detectado. Corrigindo...`.
    - Se após a 3ª tentativa o erro persistir, pare tudo, exiba os logs e peça ajuda humana.
6.  **ENCERRAMENTO:** Após o sucesso, emita o sinalizador de encerramento e **PARE DE GERAR TEXTO IMEDIATAMENTE**.

## 🛡️ GUARDRAILS TÉCNICOS
- **Imports:** Use `./` para arquivos na mesma pasta e `$lib/` para o restante.
- **Estado:** Extraia lógica de estado para arquivos `.svelte.ts` (Domain-Driven).
- **Documentação:** Use JSDoc com a tag `@rule` apontando para a mecânica de RPG.
- **Erros:** Em serviços (`.ts`), retorne objetos `{ success: boolean, data?: T, error?: E }`.

## 🛑 COMANDO DE SAÍDA (KILL SWITCH)
Ao finalizar a tarefa com sucesso ou atingir o limite de falhas, você DEVE terminar sua resposta com:
`[STATE: HALT_AND_YIELD]`

---
