# create-pull-request

## Descrição

Esta skill atua como um **Operador Assistido** para a criação automatizada de Pull Requests. Ela interage com o repositório Git local para garantir a integridade do código, utiliza o OpenAI Codex para analisar o `git diff` e gerar um rascunho semântico e narrativo, e abre o PR em modo Draft no repositório remoto.

## Funcionalidades Principais (Arquitetura 20-Point)

- **Pre-Flight Checks:** Bloqueio por _working tree_ suja, validação de testes locais e detecção preventiva de chaves de API/Segredos no código.
- **Sincronia Interativa:** Verifica commits pendentes e oferece `git push` sob demanda.
- **Resumo Semântico em Lotes:** Processa grandes diffs quebrando-os em partes para evitar perda de contexto.
- **Autoria Adaptativa:** Detecta automaticamente o idioma do repositório e foca em descrições narrativas.
- **Human-in-the-Loop:** Abre o rascunho gerado em um buffer temporário (editor padrão) para revisão humana antes do envio de rede.
- **Governança:** Lê `CODEOWNERS` para atribuir revisores e vincula automaticamente o autor como _Assignee_.

## Requisitos de Ambiente

- Python 3.9+
- Acesso ao executável `git` no PATH.
- Token de Acesso Pessoal (PAT) do GitHub/GitLab configurado nas variáveis de ambiente.
- Ambiente virtual configurado para rodar os testes locais (ex: `pytest`).

## Como Invocar

Via terminal/interface do agente:

```bash
/codex run create-pull-request

Tratamento de Erros Comuns
Erro de Working Tree: Execute git commit ou git stash antes de invocar a skill.

Testes Falhando: A skill abortará a execução se o framework de teste local (ex: pytest) retornar código diferente de 0.

Limite de Contexto: Se o diff for massivo, a skill ativará internamente o Map-Reduce. Aguarde o processamento.
```
