# Roadmap Pós-Auditoria De Alcance Da UI

## Objetivo

Este documento registra a auditoria executada depois das correções de alcance da UI em 2026-06-06, repetida depois da entrega do inventário editável em 2026-06-15, atualizada durante a entrega de loadout persistente em 2026-06-16 e revisada após a durabilidade manual v9 e a UI PWA instalável em 2026-06-19. Ele separa regressões de limitações deliberadas e recomenda quando cada ausência deve virar implementação.

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
- A entrega de durabilidade v9 em 2026-06-19 adicionou `equipmentDurabilityEvents` ao save/load, controles manuais `Íntegro`/`Danificado`/`Quebrado` no Inventário, bloqueio de item quebrado no loadout/Combate e roundtrip renderizado com Browser do Codex sem erros de console.
- A entrega PWA em 2026-06-19 adicionou manifest local, controle `Instalar app`, aviso `Atualizacao disponivel`, botao `Atualizar agora` e handler seguro `SKIP_WAITING`, sem nova dependencia, push, background sync, cloud sync ou regra de RPG.
- A auditoria encontrou um único erro de console: o request implícito de `favicon.ico` retornava 404. O favicon passou a ser declarado em `index.html` e servido por `public/favicon.svg`; uma sessão limpa confirmou zero erros e zero warnings ao abrir as nove abas.

## Classificação Pós-Correção

| Classe | Resultado |
| :--- | :--- |
| Regressão bloqueadora | Nenhuma encontrada após os gates e a auditoria renderizada. |
| Regressão não bloqueadora | Request 404 de `favicon.ico`, corrigido com favicon SVG estático e protegido por `qa:ui-reachability`. |
| Validação renderizada | Concluída em 2026-06-19 para save v9/durabilidade: nove abas, console limpo, Inventário com condição manual, bloqueio de item quebrado no Combate e restauração por save/load real. |
| Limitações deliberadas | Combate ainda usa alvos de treino, HP de treino local e não persiste dano real; magia sem execução, compêndio curado, Acampamento de uma hora e relações Tier 1 permanecem limites deliberados. |
| Internos sem necessidade de UI própria | `ActionQueueService`, `DiceService`, `ResolutionService`, repositories e serviços puros consumidos indiretamente pelas telas. |

## Futuras Implementações Recomendadas

| Implementação futura | Evidência e impacto | Dependências e gates | Melhor momento para implementar | Risco arquitetural | Responsável e referência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Desgaste, penalidade e reparo de durabilidade | A condição manual v9 existe, mas não há desgaste automático, penalidade mecânica de item danificado, reparo por Acampamento, crafting ou custo. | Gate próprio para gatilhos de desgaste, revisão das regras soberanas, Decorator/modificadores e política de reparo. | Depois de aprovar quando itens se desgastam e antes de crafting reparar itens. | Muito alto: afeta combate, crafting, inventário, Acampamento e save. | `inventory-management`/`equipment`/`combat-encounter`/`camp-hour`; inbox `20260615-future-inventory-durability`. |
| Efeitos reais de consumíveis | O cinto pode virar atalho, mas não existe contrato para cura, alvo, overdose, estado oficial ou economia de ação. | Gate próprio de efeitos de item, HP real persistido, alvos, condições e revisão das regras soberanas. | Depois do acesso rápido estar estável e depois da aprovação explícita de HP real/efeitos. | Muito alto: pode alterar combate, Character, save e regras soberanas. | `inventory-management`/`combat-encounter`/`character`; inbox `20260615-future-inventory-potion-belt` e gates futuros de HP real. |
| Perfis completos dos itens de kit inicial | Personagens novos recebem kits de classe pelo ledger de inventário, mas `chainmail`, `shortbow`, `staff`, `rapier` e `luxury-padded-armor` não possuem estatísticas soberanas implementadas. | Gate `docs/process/starting-equipment-loadout-profile-gate.md`, fonte soberana para dado/CA/tags/maos/penalidades e validação contra loadout persistido. | Somente depois de aprovar estatísticas ou substituições explícitas para cada item. | Alto: pode tornar itens equipáveis com bônus inferidos. | `equipment`/`inventory-management`/`combat-encounter`; inbox `20260618-065745-starting-equipment-catalog-implementation` e `20260619-175238-starting-equipment-profile-gap-gate`. |
| Execução real de Magia | A UI apenas prepara `cast-spell`; não gasta EE, escolhe personagem conjurador ou aplica efeitos. | Serviços de EE, seleção de alvos, execução de efeitos, ActionQueue e revisão de regras mágicas. | Depois dos contratos de recursos, alvos e efeitos; antes de integrar magia ao combate real. | Alto: regras, recursos e efeitos atravessam múltiplas features. | `spell-cast`/`magic`; inbox `20260513-233033-t27-spellcastbuilder-core` e `20260513-234107-t28-ui-de-conjuracao-minima`. |
| Persistência e aplicação dos traços | Os traços são validados na criação, mas ainda precisam ser preservados no save, aparecer na listagem e aplicar mecânicas em fase futura. | Gate v8 para relação persistida personagem-traço; Decorator e efeitos mecânicos permanecem em gate separado. | Persistência textual após aprovação do gate v8; efeitos mecânicos somente depois de contrato próprio. | Alto: altera Character, save e múltiplas mecânicas. | `character-create`/`character-list`/`ancestry`; gate `docs/process/character-traits-save-v8-gate.md`; inbox `20260505-081342-t13a-character-ancestry-trait-selection` e `20260503-221203-t12-ancestry-traits`. |
| Compêndio completo e indexado | O navegador expõe somente o catálogo curado atual, não todo o corpus de regras e lore. | Pipeline validado de ingestão, indexação, proveniência e limites de conteúdo carregado no navegador. | Depois que o pipeline de ingestão e a política de fontes forem estáveis. | Médio: conteúdo extenso pode degradar busca, bundle e precisão. | `compendium`; inbox `20260505-185244-t16a-compendium-base-catalog` e `20260505-190555-t17a-compendium-browser-ui`. |
| HP real persistido e estados oficiais | Combate mostra prévia local de HP real, mas não grava ficha nem aplica Moribundo/Inconsciente. | Aprovação do gate de dano real, gate de versão de save próprio, ledger persistido, estados oficiais e regras soberanas de 0 HP. | Somente depois da aprovação explícita do gate de save e estados oficiais. | Muito alto: afeta regras soberanas, Character, Combate, save e replay. | `combat-encounter`/`character`; inbox `20260605-173410-t98-official-incoming-damage-gate` até `20260605-201308-t104-combat-real-damage-preview-ui`. |
| Acampamento multi-hora | A sessão resolvida fica corretamente encerrada após uma hora e não oferece nova hora ou noite completa. | Orquestração explícita de nova hora, transições de sessão, persistência e revisão de atividades avançadas. | Depois que o fluxo atual de uma hora permanecer estável e o contrato de nova hora for aprovado. | Alto: pode confundir estado restaurado, clocks e histórico de atividades. | `camp-hour`; inbox `20260606-future-camp-multi-hour`. |
| Relações acima de Tier 1 | A UI permite apenas invocar favor e abater dívida Tier 1. | Revisão das regras soberanas de fama, influência, facções, custos e limites por Tier. | Depois da revisão formal das regras e antes de ampliar recompensas sociais. | Alto: implementar cedo pode inventar regras não aprovadas. | `social-standing`/`social-relations`; inbox `20260606-future-social-higher-tiers`. |
| Painel de inspeção de WorldState | WorldState é salvo e afeta diálogos, mas o jogador não possui uma visão geral dedicada. | Definir quais flags são visíveis ao jogador, labels seguras e política para esconder estado narrativo interno. | Quando houver necessidade recorrente de o jogador inspecionar fatos persistidos fora de Relações. | Médio: pode revelar spoilers ou estado técnico. | `world-state`/`app`; inbox `20260514-065055-t32-worldstate-key-value`. |
| Automacao offline/renderizada PWA | Manifest, instalacao e aviso de update foram entregues, mas a automacao de rede offline completa ainda depende de ambiente de navegador confiavel. | Gate futuro somente se o Browser do Codex expuser controle estavel de rede/cache ou se uma automacao renderizada dedicada for aprovada. | Depois de estabilizar a recorrencia de QA offline e antes de ampliar cache de dados de jogo. | Medio: testes de rede/cache podem flakar e prender versoes antigas. | `app`/`public`; inbox `20260606-future-pwa-update-install-ui` permanece apenas para automacao offline avancada. |

## Ordem Recomendada

1. Expandir perfis dos itens de kit inicial somente após o gate `starting-equipment-loadout-profile-gate` ser satisfeito por estatísticas soberanas ou substituições explícitas.
2. Planejar automacao offline/renderizada PWA somente quando o Browser do Codex oferecer controle confiavel de rede/cache ou quando o fluxo ficar recorrente o bastante para justificar gate proprio.
3. Ampliar Compêndio após pipeline de ingestão, pois ele reduz dependência de consulta manual às regras.
4. Implementar Acampamento multi-hora e Relações superiores apenas após seus contratos explícitos.
5. Manter efeitos reais de consumíveis, execução de Magia, desgaste automático e HP real persistido para fases posteriores, pois possuem maior risco de regra, save e integração.
6. Criar painel de WorldState quando houver demanda recorrente e contrato de visibilidade definido.

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
exigindo fases proprias e contrato novo antes de qualquer código. O gate de
tracos persistidos e save v8 foi aprovado em
`docs/process/character-traits-save-v8-gate.md`; ele cobre apenas as 3 escolhas
textuais de tracos por personagem, enquanto efeitos mecanicos e Decorator
continuam exigindo fases proprias.

O gate conservador de equipamento inicial foi aprovado em
`docs/process/starting-equipment-ledger-grant-gate.md`; ele cobre apenas
catalogo minimo, concessao para personagens novos pelo ledger de inventario
existente e bloqueio de auto-loadout para itens sem perfil seguro.

A concessao conservadora de equipamento inicial foi entregue para personagens
novos. Itens sem perfil seguro seguem visiveis como carga/ownership, mas nao
ganham acao de equipar, perfil de combate, ouro inicial, durabilidade mutavel ou
efeitos mecanicos por inferencia.
O gate `docs/process/starting-equipment-loadout-profile-gate.md` formaliza que
`chainmail`, `shortbow`, `staff`, `rapier` e `luxury-padded-armor` continuam sem
loadout/combate ate existir fonte soberana suficiente.

O gate de durabilidade v9 foi aprovado e entregue em
`docs/process/equipment-durability-save-v9-gate.md`; ele cobre apenas condicao
manual por ledger, UI no Inventario, bloqueio de item quebrado no
loadout/Combate e migracao para save v9. Desgaste automatico, penalidade de
item danificado, reparo por Acampamento, crafting, custos e HP real continuam
exigindo fases proprias. Itens de kit inicial sem estatisticas soberanas
continuam sem perfil seguro de loadout/combate.

Uma futura tarefa só deve começar quando:

- a entrada correspondente do `change-inbox` tiver um plano aprovado;
- as fontes soberanas aplicáveis tiverem sido revisadas;
- migrations ou mudanças de save tiverem gate próprio aprovado;
- testes de domínio puderem ser escritos antes da UI;
- o roteiro de Browser do Codex estiver definido para a nova superfície visível.
