# Diretiva de Autonomia e Orquestracao do Codex

Este arquivo orienta como o Codex deve escolher ferramentas, profundidade de analise,
validacao e uso de skills/plugins neste workspace.

Esta diretiva nunca sobrescreve instrucoes superiores do sistema, do desenvolvedor,
do sandbox, das permissoes de escrita, nem regras especificas das ferramentas
disponiveis na sessao.

## Regras Operacionais

### 1. Selecao Adaptativa

- Para tarefas simples, responda ou execute diretamente com baixo overhead.
- Para mudancas estruturais, faca exploracao inicial, forme um plano curto e so
  entao implemente.
- Nao trate `Fast`, `Instant`, `Thinking` ou nomes parecidos como comandos
  internos acionaveis. Eles representam apenas intencao de rapidez ou
  profundidade.
- Use esforcos/modelos alternativos apenas quando a ferramenta disponivel
  permitir e quando as regras ativas da sessao autorizarem.

### 2. Modelos e Subagentes

- Nao assuma que o modelo principal pode ser trocado dinamicamente.
- So crie subagentes quando o usuario pedir explicitamente agentes, delegacao ou
  trabalho paralelo, ou quando a politica ativa da sessao permitir.
- Quando subagentes forem usados, escolha apenas entre os modelos disponiveis na
  sessao e defina escopo fechado, arquivos/responsabilidades e criterio de
  entrega.
- Se a troca de modelo nao estiver exposta por ferramenta disponivel, registre
  isso como limitacao em vez de simular a troca.

### 3. Modo de Planejamento

- Nao tente ativar `Plan Mode` por este arquivo.
- Em `Default Mode`, aja com autonomia pragmatica: explore, implemente e valide
  quando a intencao do usuario for execucao.
- Quando a tarefa estiver ambigua ou arriscada, faca uma pergunta objetiva antes
  de alterar arquivos.
- Use planos/checklists apenas como ferramenta operacional, nao como mudanca de
  modo de colaboracao.

### 4. Integracao de Ferramentas

- Use skills/plugins existentes quando a tarefa corresponder claramente ao escopo
  deles.
- Leia apenas os arquivos necessarios de cada skill para controlar contexto.
- Use `rg` e leituras direcionadas antes de buscas massivas.
- Use `apply_patch` para edicoes manuais de arquivos.
- Respeite sandbox, aprovacoes e worktree sujo; nunca reverta alteracoes do
  usuario sem pedido explicito.

### 5. Barreira de Eficiencia

- Minimize consumo de contexto e tokens.
- Se a tarefa exigir leitura massiva, loops longos ou analise ampla demais, pare
  antes de consumir contexto excessivo.
- Apresente alternativas mais economicas, com pros/contras, recomende uma opcao
  e peca instrucao clara antes de continuar.

### 6. Validacao

- Sempre que houver alteracao de codigo, rode validacao proporcional ao risco.
- Se nao for possivel validar, informe claramente o motivo.
- Para tarefas grandes, registre evidencia suficiente para outro modelo continuar.
