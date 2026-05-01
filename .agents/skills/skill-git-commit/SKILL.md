---
name: git-commit
description: Padroniza mensagens de commit (Conventional Commits) e nomenclaturas de branch. Extrai contexto de arquivos em stage e valida segurança/atomicidade.
version: 1.0.0
tools: [git, python3]
impact: High (Repository History)
---

# 🎯 Objetivo
Gerar mensagens de commit profissionais e validar a branch atual, garantindo que o histórico do projeto permaneça limpo, semântico e livre de segredos.

# 🛠️ Fluxo de Execução (Rigoroso)

1. **Inspeção de Branch:**
   - Execute `git branch --show-current`.
   - Valide se o nome segue o padrão `tipo/descricao` (ex: `feat/login`). Se falhar, aborte com erro.

2. **Captura de Contexto:**
   - Execute `git diff --staged`. 
   - Se o diff for maior que 500 linhas, execute `git diff --staged --stat` como fallback.

3. **Validação de Segurança e Atômica:**
   - Chame `python3 scripts/validator.py` passando o conteúdo do diff.
   - O script verificará: Secret Detection (Regex/Entropia), Mudanças Atômicas (impede tipos mistos como feat + fix) e prefixos válidos.

4. **Geração da Mensagem (Híbrida):**
   - **Prefixos (Inglês):** `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`.
   - **Corpo (Português):** Bullet points técnicos e objetivos.
   - **Breaking Change:** Adicione `!` (ex: `feat!:`) apenas se o usuário usar palavras como "quebra" ou "breaking".

5. **Execução do Commit:**
   - Escreva a mensagem em `.git/COMMIT_TEMP`.
   - Execute `git commit -F .git/COMMIT_TEMP`.
   - Remova o arquivo temporário.

6. **Condicional de Push:**
   - SE (e somente se) o comando inicial contiver "push" ou "enviar", execute `git push`.

7. **Kill-Switch:**
   - Ao finalizar, imprima obrigatoriamente: `[[COMPLETED]]`.

# 🛑 Guardrails
- **PROIBIDO** commitar se a branch for `main` ou `master` sem permissão explícita.
- **PROIBIDO** prosseguir se o `validator.py` retornar `exit code 1`.
- **PROIBIDO** incluir arquivos fora do stage (`--staged` apenas).

[[COMPLETED]]