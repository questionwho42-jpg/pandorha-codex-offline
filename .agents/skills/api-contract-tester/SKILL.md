---
name: api-contract-tester
description: Atua como um Quality Gate no fechamento de Pull Requests (Pre-PR). Valida a especificação OpenAPI consolidada contra a AST do código-fonte, forçando o design-first e garantindo que descrições sejam explícitas para IA.
trigger: automatic_on_pre_pr
version: 1.0.0
tools_required: [terminal, file_writer]
---

# API Contract Tester Protocol

## 1. Contexto e Gatilho

Você deve executar esta skill obrigatoriamente ANTES de concluir a geração de qualquer Pull Request. O seu objetivo é cruzar a especificação OpenAPI com o código real e avaliar a qualidade semântica da documentação.

## 2. Guardrail de Extração (Fail-Fast)

Você está **proibido** de ler os arquivos de rota e o `swagger.yaml` manualmente com suas ferramentas de leitura. Você deve usar o script de suporte Python que utiliza `uv` para execução efêmera e segura.

**Passo a Passo:**

1. Localize os caminhos absolutos para o arquivo de contrato (ex: `swagger.yaml` ou `openapi.json`) e o diretório fonte (`/src` ou `/app`).
2. Execute no terminal:
   `uv run .agents/skills/api-contract-tester/scripts/extract_ast.py <CAMINHO_DO_CONTRATO> <CAMINHO_DO_SRC>`
3. **Contingência Crítica:** Se o script retornar um _Stack Trace_ ou erro fatal (Exit Code != 0), você NÃO deve tentar consertar o código-fonte. Imprima imediatamente o marcador de saída abaixo e interrompa a execução aguardando o humano.

## 3. Avaliação Semântica (As 3 Regras de Ouro)

O script retornará um JSON minimalista listando rotas e parâmetros extraídos, bem como falhas estruturais (tipos errados, rotas fantasmas).
Para os itens que exigem avaliação de descrição (`"needs_eval": true`), utilize estritamente o seguinte checklist ("Regras de Ouro"). A descrição falha se:

- **Regra 1:** Não indica a ação ou a mutação exata de estado (ex: apenas "ID" é falha; "ID único do usuário a ser inativado" é passe).
- **Regra 2:** Assume conhecimento de negócio não documentado na própria string.
- **Regra 3:** Não define os limites do dado (ex: formatos esperados, max/min, enums explícitos).

## 4. Remediação e Geração de Evidências (Stateless)

Se o JSON ou sua avaliação identificarem discrepâncias:

1. **NÃO** tente corrigir o código-fonte ou o contrato autonomamente.
2. Substitua (sobrescrita destrutiva) qualquer arquivo anterior e crie `contract-failures.md` na raiz do projeto.
3. Formate este arquivo estritamente como uma **Markdown Task List** (`- [ ] Tarefa`).
4. Inclua falhas estruturais do JSON (ex: tipos incompatíveis, rotas fantasmas bloqueantes) e falhas da sua avaliação semântica.
   _(Nota: Rotas não implementadas mas presentes no contrato são apenas "Warnings" e não devem bloquear a lista, apenas constar no rodapé)._

## 5. Protocolo de Encerramento Obrigatório (KILL SWITCH)

Caso você tenha gerado o `contract-failures.md` ou o script tenha sofrido crash, você atingiu um estado de bloqueio.
Imprima EXATAMENTE o marcador abaixo na sua resposta ao usuário e **NÃO GERE NENHUM TOKEN ADICIONAL**. Isso forçará o orquestrador a suspender a sessão, poupando cotas.

[[AWAITING_HUMAN_REVIEW]]
