---
name: crafting-engine
description: "INVOQUE APENAS quando o usuário solicitar explicitamente o consumo de materiais, ouro e tempo para iniciar a forja de um item, ou para coletar um item previamente forjado. NÃO invoque para discutir lore ou inventário."
version: "1.0.0"
author: "Arquiteto Rigoroso"
---

# GUARDRAILS DE EXECUÇÃO E ESTADO

Você é um agente de execução restrita. Siga a estrutura de blocos condicionais abaixo estritamente.

## ESTADO 0: RESOLUÇÃO DE IDENTIDADE E PREPARAÇÃO

1. Antes de gerar qualquer payload, utilize o comando `grep -i "<nome_do_item>" references/items.json` e `references/talents.json`.
2. Extraia o ID exato do item e os requisitos de ofício. Se não encontrar, pule para a seção "SAÍDA E ENCERRAMENTO" relatando a falha (Fail-fast).
3. Identifique a intenção do usuário: Ele quer "INICIAR" um crafting ou "COLETAR" itens prontos?

IF INTENÇÃO == "INICIAR" THEN GOTO ESTADO A;
IF INTENÇÃO == "COLETAR" THEN GOTO ESTADO B;

## ESTADO A: FLUXO DE INÍCIO DE CRAFTING

1. Crie ou sobrescreva o arquivo `crafting_intent.json` na raiz executando um array (lote) com o seguinte esquema estrutural:

```json
{
  "action": "start_craft",
  "payload": [{ "target_id": "ID_ENCONTRADO", "quantity": 1 }]
}
```

Execute o motor: python scripts/craft_engine.py --payload crafting_intent.json

Leia o stdout estritamente formatado em JSON.

GOTO SAÍDA E ENCERRAMENTO.

ESTADO B: FLUXO DE COLETA DE FILA
Crie ou sobrescreva o arquivo crafting_intent.json com a intenção de coleta:

JSON

{
"action": "claim_item",
"payload": []
}
Execute o motor: python scripts/craft_engine.py --payload crafting_intent.json

Leia o stdout estritamente formatado em JSON.

GOTO SAÍDA E ENCERRAMENTO.

SAÍDA E ENCERRAMENTO (OBRIGATÓRIO)
Analise o JSON retornado pelo script craft_engine.py.

Comunique os resultados ao usuário GERANDO ESTRITAMENTE UMA TABELA MARKDOWN com as colunas: Ação | Item | Quantidade | Status | Detalhe (Sucesso, Falta Ouro/Talento, Tempo Restante).

Não sugira alternativas caso falte materiais (Bloqueio Rígido / Fail-fast).

APÓS imprimir a tabela no chat, VOCÊ DEVE encerrar imediatamente o processo do terminal para evitar ociosidade. Execute: exit ou kill $$.
