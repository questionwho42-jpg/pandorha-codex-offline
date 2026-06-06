# Roadmap Pós-Auditoria De Alcance Da UI

## Objetivo

Este documento registra a auditoria executada depois das correções de alcance da UI em 2026-06-06. Ele separa regressões de limitações deliberadas e recomenda quando cada ausência deve virar implementação.

Nenhuma ausência descrita aqui autoriza inferir ou alterar regras em `docs/system/`. Toda implementação futura deve seguir planejamento, TDD, memória tripla e revisão das fontes soberanas aplicáveis.

## Evidências Da Auditoria

- `qa:ui-reachability` passou e confirmou a montagem contratual das nove abas, copy atual e preservação do log imediato do Acampamento.
- `qa:vertical-slice`, `qa:social-browser-smoke` e `qa:dialogue-seeds` passaram.
- Os 707 testes do projeto passaram.
- O mapeamento estático confirmou painéis acessíveis para Personagens, Compêndio, Inventário, Exploração, Acampamento, Relações, Magia e Combate.
- A auditoria renderizada pós-correção no Browser do Codex ficou bloqueada por política ativa que recusou `http://localhost:5173/`. O aceite renderizado deve ser repetido quando essa política permitir acesso novamente.

## Classificação Pós-Correção

| Classe | Resultado |
| :--- | :--- |
| Regressão bloqueadora | Nenhuma encontrada pelos gates executáveis. |
| Regressão não bloqueadora | Nenhuma encontrada pelos gates executáveis. |
| Validação renderizada pendente | Repetir o fluxo completo no Browser do Codex quando `localhost:5173` estiver permitido. |
| Limitações deliberadas | Inventário read-only, magia sem execução, compêndio curado, Acampamento de uma hora, relações Tier 1 e combate sem HP real persistido. |
| Internos sem necessidade de UI própria | `ActionQueueService`, `DiceService`, `ResolutionService`, repositories e serviços puros consumidos indiretamente pelas telas. |

## Futuras Implementações Recomendadas

| Implementação futura | Evidência e impacto | Dependências e gates | Melhor momento para implementar | Risco arquitetural | Responsável e referência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Inventário editável e pertencente ao personagem | A aba atual mostra catálogo e carga somente leitura; o jogador não pode adicionar, remover ou equipar itens persistidos. | Contrato de propriedade de itens, repository, save version aprovado, integração explícita com equipamento e testes de capacidade. | Depois que propriedade e persistência de itens forem aprovadas; antes de tornar equipamento de combate persistente. | Alto: pode acoplar Inventário, Character, Combate e save. | `inventory`/`equipment`; inbox `20260513-203725-t25-inventory-read-only-ui` e `20260513-202933-t24-inventorycapacityservice`. |
| Execução real de Magia | A UI apenas prepara `cast-spell`; não gasta EE, escolhe personagem conjurador ou aplica efeitos. | Serviços de EE, seleção de alvos, execução de efeitos, ActionQueue e revisão de regras mágicas. | Depois dos contratos de recursos, alvos e efeitos; antes de integrar magia ao combate real. | Alto: regras, recursos e efeitos atravessam múltiplas features. | `spell-cast`/`magic`; inbox `20260513-233033-t27-spellcastbuilder-core` e `20260513-234107-t28-ui-de-conjuracao-minima`. |
| Persistência e aplicação dos traços | Os traços são validados na criação, mas não aparecem na listagem, não entram no save e não aplicam mecânicas. | Contrato de ficha, relação persistida personagem-traço, migration aprovada e Decorator para efeitos mecânicos. | Depois que o contrato completo da ficha e a migration forem aprovados. | Alto: altera Character, save e múltiplas mecânicas. | `character-create`/`character-list`/`ancestry`; inbox `20260505-081342-t13a-character-ancestry-trait-selection` e `20260503-221203-t12-ancestry-traits`. |
| Compêndio completo e indexado | O navegador expõe somente o catálogo curado atual, não todo o corpus de regras e lore. | Pipeline validado de ingestão, indexação, proveniência e limites de conteúdo carregado no navegador. | Depois que o pipeline de ingestão e a política de fontes forem estáveis. | Médio: conteúdo extenso pode degradar busca, bundle e precisão. | `compendium`; inbox `20260505-185244-t16a-compendium-base-catalog` e `20260505-190555-t17a-compendium-browser-ui`. |
| HP real persistido e estados oficiais | Combate mostra prévia local de HP real, mas não grava ficha nem aplica Moribundo/Inconsciente. | Aprovação do gate de dano real, save v6, ledger persistido, estados oficiais e regras soberanas de 0 HP. | Somente depois da aprovação explícita do gate de save v6 e estados oficiais. | Muito alto: afeta regras soberanas, Character, Combate, save e replay. | `combat-encounter`/`character`; inbox `20260605-173410-t98-official-incoming-damage-gate` até `20260605-201308-t104-combat-real-damage-preview-ui`. |
| Acampamento multi-hora | A sessão resolvida fica corretamente encerrada após uma hora e não oferece nova hora ou noite completa. | Orquestração explícita de nova hora, transições de sessão, persistência e revisão de atividades avançadas. | Depois que o fluxo atual de uma hora permanecer estável e o contrato de nova hora for aprovado. | Alto: pode confundir estado restaurado, clocks e histórico de atividades. | `camp-hour`; inbox `20260606-future-camp-multi-hour`. |
| Relações acima de Tier 1 | A UI permite apenas invocar favor e abater dívida Tier 1. | Revisão das regras soberanas de fama, influência, facções, custos e limites por Tier. | Depois da revisão formal das regras e antes de ampliar recompensas sociais. | Alto: implementar cedo pode inventar regras não aprovadas. | `social-standing`/`social-relations`; inbox `20260606-future-social-higher-tiers`. |
| Painel de inspeção de WorldState | WorldState é salvo e afeta diálogos, mas o jogador não possui uma visão geral dedicada. | Definir quais flags são visíveis ao jogador, labels seguras e política para esconder estado narrativo interno. | Quando houver necessidade recorrente de o jogador inspecionar fatos persistidos fora de Relações. | Médio: pode revelar spoilers ou estado técnico. | `world-state`/`app`; inbox `20260514-065055-t32-worldstate-key-value`. |
| Instalação e atualização PWA | O status offline existe, mas não há manifest instalável com ícones nem tela de atualização de cache. | Smoke offline/rede confiável, manifest, assets e política segura de atualização do service worker. | Depois que a automação offline e o comportamento de atualização estiverem estáveis. | Médio: cache incorreto pode manter versões obsoletas. | `app`/`public`; inbox `20260606-future-pwa-update-install-ui`. |

## Ordem Recomendada

1. Repetir o aceite renderizado no Browser do Codex quando `localhost:5173` voltar a ser permitido.
2. Implementar Inventário persistido antes de equipamento persistido ou desgaste.
3. Persistir traços somente junto ao contrato completo de ficha e migration.
4. Ampliar Compêndio após pipeline de ingestão, pois ele reduz dependência de consulta manual às regras.
5. Implementar Acampamento multi-hora e Relações superiores apenas após seus contratos explícitos.
6. Manter execução de Magia e HP real persistido para fases posteriores, pois possuem maior risco de regra, save e integração.
7. Criar painel de WorldState e UI PWA quando houver demanda recorrente e contratos de visibilidade/atualização definidos.

## Gate Para Retomar Cada Item

Uma futura tarefa só deve começar quando:

- a entrada correspondente do `change-inbox` tiver um plano aprovado;
- as fontes soberanas aplicáveis tiverem sido revisadas;
- migrations ou mudanças de save tiverem gate próprio aprovado;
- testes de domínio puderem ser escritos antes da UI;
- o roteiro de Browser do Codex estiver definido para a nova superfície visível.
