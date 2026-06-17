# Roadmap Pós-Auditoria De Alcance Da UI

## Objetivo

Este documento registra a auditoria executada depois das correções de alcance da UI em 2026-06-06, repetida depois da entrega do inventário editável em 2026-06-15 e atualizada durante a entrega de loadout persistente em 2026-06-16. Ele separa regressões de limitações deliberadas e recomenda quando cada ausência deve virar implementação.

Nenhuma ausência descrita aqui autoriza inferir ou alterar regras em `docs/system/`. Toda implementação futura deve seguir planejamento, TDD, memória tripla e revisão das fontes soberanas aplicáveis.

## Evidências Da Auditoria

- `qa:ui-reachability` passou e confirmou a montagem contratual das nove abas, copy atual e preservação do log imediato do Acampamento.
- `qa:vertical-slice`, `qa:social-browser-smoke` e `qa:dialogue-seeds` passaram.
- Os 747 testes do projeto passaram com cobertura global de 100%.
- O mapeamento estático confirmou painéis acessíveis para Personagens, Compêndio, Inventário, Exploração, Acampamento, Relações, Magia e Combate.
- A auditoria estática do inventário confirmou seletor de personagem, catálogo, carregar equipamento, equipar/desequipar arma, escudo e armadura, bloquear remoção equipada, carregar/incrementar/consumir consumível, remover item, estado vazio e ação para abrir Personagens.
- A auditoria renderizada foi concluída em 2026-06-15 com o Playwright solicitado pelo usuário: as nove abas abriram, o inventário editável executou carregar, incrementar, consumir, remover e sobrecarga, e o roundtrip de save v6 restaurou personagem, inventário, Acampamento e negociação social.
- A auditoria renderizada foi repetida em 2026-06-16 com o Browser do Codex/Playwright usando Chrome local: as nove abas abriram sem erros de console, o inventário executou carregar, equipar arma/escudo/armadura, substituir arma, bloquear remoção equipada, desequipar, remover, criar duas pilhas de consumível, consumir e confirmar sobrecarga `Imobilizado`; o roundtrip de save v7 restaurou personagem, inventário com loadout, Acampamento e negociação social.
- A entrega de integração de combate com loadout persistido removeu os seletores locais de arma/escudo/armadura da aba `Combate`; personagens da sessão agora derivam arma ativa e defesa equipada do ledger de inventário/loadout.
- A entrega de cinto de poções em 2026-06-17 adicionou acesso rápido no `Combate` para `potion-belt-stack`, consumindo 1 unidade pelo ledger de inventário existente sem cura, HP real, HP de treino ou estados oficiais.
- A auditoria encontrou um único erro de console: o request implícito de `favicon.ico` retornava 404. O favicon passou a ser declarado em `index.html` e servido por `public/favicon.svg`; uma sessão limpa confirmou zero erros e zero warnings ao abrir as nove abas.

## Classificação Pós-Correção

| Classe | Resultado |
| :--- | :--- |
| Regressão bloqueadora | Nenhuma encontrada após os gates e a auditoria renderizada. |
| Regressão não bloqueadora | Request 404 de `favicon.ico`, corrigido com favicon SVG estático e protegido por `qa:ui-reachability`. |
| Validação renderizada | Concluída em 2026-06-16 para save v7/loadout: nove abas, console limpo, inventário editável, loadout persistido, Acampamento e negociação restaurados. |
| Limitações deliberadas | Combate ainda usa alvos de treino, HP de treino local e não persiste dano real; magia sem execução, compêndio curado, Acampamento de uma hora e relações Tier 1 permanecem limites deliberados. |
| Internos sem necessidade de UI própria | `ActionQueueService`, `DiceService`, `ResolutionService`, repositories e serviços puros consumidos indiretamente pelas telas. |

## Futuras Implementações Recomendadas

| Implementação futura | Evidência e impacto | Dependências e gates | Melhor momento para implementar | Risco arquitetural | Responsável e referência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Durabilidade e desgaste | O catálogo e o núcleo T86 conhecem durabilidade, mas o ledger de ownership não registra desgaste. | Loadout persistente, integração com combate, revisão de regras soberanas e ledger próprio. | Depois da integração estável com combate e antes de crafting reparar itens. | Muito alto: afeta combate, crafting, inventário e save. | `inventory-management`/`equipment`/`combat-encounter`; inbox `20260615-future-inventory-durability`. |
| Efeitos reais de consumíveis | O cinto pode virar atalho, mas não existe contrato para cura, alvo, overdose, estado oficial ou economia de ação. | Gate próprio de efeitos de item, HP real persistido, alvos, condições e revisão das regras soberanas. | Depois do acesso rápido estar estável e depois da aprovação explícita de HP real/efeitos. | Muito alto: pode alterar combate, Character, save e regras soberanas. | `inventory-management`/`combat-encounter`/`character`; inbox `20260615-future-inventory-potion-belt` e gates futuros de HP real. |
| Equipamento inicial | Personagens começam sem eventos de inventário; classe e antecedente ainda não concedem kits. | Contrato completo de ficha, classes, antecedentes, catálogos e concessão determinística por ledger. | Junto da próxima evolução aprovada da criação de personagem. | Alto: pode duplicar itens ou inferir kits não oficiais. | `character-create`/`inventory-management`; inbox `20260615-future-inventory-starting-equipment`. |
| Execução real de Magia | A UI apenas prepara `cast-spell`; não gasta EE, escolhe personagem conjurador ou aplica efeitos. | Serviços de EE, seleção de alvos, execução de efeitos, ActionQueue e revisão de regras mágicas. | Depois dos contratos de recursos, alvos e efeitos; antes de integrar magia ao combate real. | Alto: regras, recursos e efeitos atravessam múltiplas features. | `spell-cast`/`magic`; inbox `20260513-233033-t27-spellcastbuilder-core` e `20260513-234107-t28-ui-de-conjuracao-minima`. |
| Persistência e aplicação dos traços | Os traços são validados na criação, mas não aparecem na listagem, não entram no save e não aplicam mecânicas. | Contrato de ficha, relação persistida personagem-traço, migration aprovada e Decorator para efeitos mecânicos. | Depois que o contrato completo da ficha e a migration forem aprovados. | Alto: altera Character, save e múltiplas mecânicas. | `character-create`/`character-list`/`ancestry`; inbox `20260505-081342-t13a-character-ancestry-trait-selection` e `20260503-221203-t12-ancestry-traits`. |
| Compêndio completo e indexado | O navegador expõe somente o catálogo curado atual, não todo o corpus de regras e lore. | Pipeline validado de ingestão, indexação, proveniência e limites de conteúdo carregado no navegador. | Depois que o pipeline de ingestão e a política de fontes forem estáveis. | Médio: conteúdo extenso pode degradar busca, bundle e precisão. | `compendium`; inbox `20260505-185244-t16a-compendium-base-catalog` e `20260505-190555-t17a-compendium-browser-ui`. |
| HP real persistido e estados oficiais | Combate mostra prévia local de HP real, mas não grava ficha nem aplica Moribundo/Inconsciente. | Aprovação do gate de dano real, gate de versão de save próprio, ledger persistido, estados oficiais e regras soberanas de 0 HP. | Somente depois da aprovação explícita do gate de save e estados oficiais. | Muito alto: afeta regras soberanas, Character, Combate, save e replay. | `combat-encounter`/`character`; inbox `20260605-173410-t98-official-incoming-damage-gate` até `20260605-201308-t104-combat-real-damage-preview-ui`. |
| Acampamento multi-hora | A sessão resolvida fica corretamente encerrada após uma hora e não oferece nova hora ou noite completa. | Orquestração explícita de nova hora, transições de sessão, persistência e revisão de atividades avançadas. | Depois que o fluxo atual de uma hora permanecer estável e o contrato de nova hora for aprovado. | Alto: pode confundir estado restaurado, clocks e histórico de atividades. | `camp-hour`; inbox `20260606-future-camp-multi-hour`. |
| Relações acima de Tier 1 | A UI permite apenas invocar favor e abater dívida Tier 1. | Revisão das regras soberanas de fama, influência, facções, custos e limites por Tier. | Depois da revisão formal das regras e antes de ampliar recompensas sociais. | Alto: implementar cedo pode inventar regras não aprovadas. | `social-standing`/`social-relations`; inbox `20260606-future-social-higher-tiers`. |
| Painel de inspeção de WorldState | WorldState é salvo e afeta diálogos, mas o jogador não possui uma visão geral dedicada. | Definir quais flags são visíveis ao jogador, labels seguras e política para esconder estado narrativo interno. | Quando houver necessidade recorrente de o jogador inspecionar fatos persistidos fora de Relações. | Médio: pode revelar spoilers ou estado técnico. | `world-state`/`app`; inbox `20260514-065055-t32-worldstate-key-value`. |
| Instalação e atualização PWA | O status offline existe, mas não há manifest instalável com ícones nem tela de atualização de cache. | Smoke offline/rede confiável, manifest, assets e política segura de atualização do service worker. | Depois que a automação offline e o comportamento de atualização estiverem estáveis. | Médio: cache incorreto pode manter versões obsoletas. | `app`/`public`; inbox `20260606-future-pwa-update-install-ui`. |

## Ordem Recomendada

1. Entregar equipamento inicial somente junto ao contrato completo de ficha.
2. Persistir traços somente junto ao contrato completo de ficha e migration.
3. Ampliar Compêndio após pipeline de ingestão, pois ele reduz dependência de consulta manual às regras.
4. Implementar Acampamento multi-hora e Relações superiores apenas após seus contratos explícitos.
5. Manter efeitos reais de consumíveis, execução de Magia e HP real persistido para fases posteriores, pois possuem maior risco de regra, save e integração.
6. Criar painel de WorldState e UI PWA quando houver demanda recorrente e contratos de visibilidade/atualização definidos.

## Gate Para Retomar Cada Item

O gate de propriedade do inventario e save v6 foi aprovado em
`docs/process/inventory-ownership-save-v6-gate.md`. Ledger, persistencia v6 e
UI editavel foram entregues. O contrato de loadout persistente e save v7 foi aprovado em
`docs/process/equipment-loadout-save-v7-gate.md` para a tarefa
`20260615-201706-persistent-equipment-loadout-save-v7`; ele cobre apenas
`equipmentLoadoutEvents`, equipar/desequipar e roundtrip de loadout. O contrato
de integração do combate com esse loadout foi aprovado em
`docs/process/combat-persistent-loadout-gate.md` e implementado na entrega de
combate com loadout persistido. O primeiro gate do cinto de pocoes foi aprovado
em `docs/process/potion-belt-quick-access-gate.md` e implementado na fatia
`20260617-060205-combat-potion-belt-quick-access`; ele cobre apenas acesso
rapido e decremento de `potion-belt-stack` pelo ledger existente. Durabilidade,
efeitos reais de item, cura, HP real e economia de acao oficial continuam
exigindo fases proprias e contrato novo antes de qualquer código.

Uma futura tarefa só deve começar quando:

- a entrada correspondente do `change-inbox` tiver um plano aprovado;
- as fontes soberanas aplicáveis tiverem sido revisadas;
- migrations ou mudanças de save tiverem gate próprio aprovado;
- testes de domínio puderem ser escritos antes da UI;
- o roteiro de Browser do Codex estiver definido para a nova superfície visível.
