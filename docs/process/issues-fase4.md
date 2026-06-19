# Issue Tracker: Downtime dos Andarilhos e Recesso no Bastião (Fase 4)

Este arquivo contém a lista de fatias verticais (Tracer Bullets) aprovadas e prontas para execução, baseadas no plano de implementação da Fase 4.

---

## Issue 1: Criação e Alinhamento do ADR-017: Arquitetura e Interfaces do Downtime

- **ID:** Issue-1
- **Type:** HITL
- **Blocked by:** None - can start immediately

### What to build
Oficialização e revisão técnica da estratégia de isolamento arquitetônico no FSD para o novo slice `entities/downtime`. Definir as interfaces adaptadoras e adapters locais para evitar acoplamento circular com `Characters`, `Factions`, `Equipment`, `Research` e `Siege`.

### Acceptance criteria
- [x] Arquivo `docs/adr/ADR-017-wanderer-downtime-engine.md` criado e revisado.

---

## Issue 2: Schema Drizzle e Migrações SQLite WASM do Recesso Global

- **ID:** Issue-2
- **Type:** AFK
- **Blocked by:** Issue-1

### What to build
Modelagem física e persistência do recesso do grupo. Criação da tabela `campaign_recess` contendo o saldo global de dias de recesso acumulados (`recess_days`) e da tabela `downtime_action_logs` para auditar rolagens e decisões. Geração e registro da migração Drizzle correspondente no worker.

### Acceptance criteria
- [x] Arquivo `src/entities/downtime/model/downtimeSchema.ts` criado com as tabelas descritas.
- [x] Migração gerada com sucesso via `npm run db:generate`.
- [x] Nova migração registrada em `src/shared/persistence/model/sqliteMigrations.ts`.
- [x] Testes de integração na persistência verificando a carga e gravação de saldos.

---

## Issue 3A: DowntimeService - Tag A: Busca Legal de Ouro (Sustento)

- **ID:** Issue-3A
- **Type:** AFK
- **Blocked by:** Issue-2

### What to build
Implementação no `DowntimeService.ts` da lógica da Tag A (Busca Legal de Ouro). Permite ao Andarilho trabalhar durante a semana de recesso. Rolar d20 + Atributo do Trabalho vs DC 10 (Sustento), DC 15 (15 PO, Crítico: 30 PO + 1 Favor Menor) ou DC 20 (50 PO, Crítico: 100 PO + 1 Favor Maior).

### Acceptance criteria
- [x] Lógica da Tag A codificada no `DowntimeService.ts` usando o Result Pattern.
- [x] Teste unitário em `DowntimeService.spec.ts` validando rolagens e ganhos em ouro e favores em todas as faixas de DC (10, 15, 20) com mocks de dados determinísticos.

---

## Issue 3B: DowntimeService - Tag B: Recuperação Prolongada Intensiva (Curas)

- **ID:** Issue-3B
- **Type:** AFK
- **Blocked by:** Issue-2

### What to build
Implementação no `DowntimeService.ts` da lógica de cura intensiva de enfermidades (`Tag B`). Permite que um Andarilho inativo na semana de recesso gaste 100 PO em santuários para remover enfermidades graves, toxinas ativas ou reduções de HP máximo decorrentes de dano necrótico.

### Acceptance criteria
- [x] Lógica da Tag B codificada no `DowntimeService.ts`.
- [x] Teste unitário em `DowntimeService.spec.ts` validando a dedução de 100 PO e a remoção de condições permanentes/enfermidades da ficha com sucesso.

---

## Issue 3C: DowntimeService - Tag C: Investigação Arcana/Urbana (Revelação de Fraquezas)

- **ID:** Issue-3C
- **Type:** AFK
- **Blocked by:** Issue-2

### What to build
Implementação no `DowntimeService.ts` da Tag C (Investigação). Permite rolar `Mental + Interação/Furtividade` vs DC 20/25 gastando ouro de suborno para descobrir imunidades, resistências e eixos de fraquezas de bosses ou locais de perigo regionais.

### Acceptance criteria
- [x] Lógica da Tag C codificada no `DowntimeService.ts`.
- [x] Teste unitário em `DowntimeService.spec.ts` simulando a rolagem determinística de investigação e o destrancamento de segredos de monstros.

---

## Issue 3D: DowntimeService - Tag D: Compra e Venda Especulativa no Submundo

- **ID:** Issue-3D
- **Type:** AFK
- **Blocked by:** Issue-2

### What to build
Implementação no `DowntimeService.ts` da Tag D (Especulação Mercantil). Rolar `Social + Avaliação` vs DC 20. Sucesso concede +20% de ouro em vendas ou -20% de desconto em compras. Falha crítica resulta em multas ou recebimento de itens falsos/runas mortas.

### Acceptance criteria
- [x] Lógica da Tag D codificada no `DowntimeService.ts`.
- [x] Teste unitário em `DowntimeService.spec.ts` cobrindo o fluxo de sucesso de barganha (ganhos de PO) e falha crítica (perdas de 20 PO).

---

## Issue 3E: DowntimeService - Tag E: Boemia e Lavagem de Infâmia

- **ID:** Issue-3E
- **Type:** AFK
- **Blocked by:** Issue-2

### What to build
Implementação no `DowntimeService.ts` da Tag E (Limpeza de Nome). Jogar moedas de ouro (15 a 50 PO) in tavernas e rolar `Social/Carisma` vs DC de hostilidade local para reduzir pontos acumulados de Infâmia na campanha.

### Acceptance criteria
- [x] Lógica da Tag E codificada no `DowntimeService.ts`.
- [x] Teste unitário em `DowntimeService.spec.ts` validando a redução proporcional da infâmia em relação ao ouro gasto em suborno/bebidas.

---

## Issue 3F: DowntimeService - Tag F: Re-Treinamento (Respec de Talentos)

- **ID:** Issue-3F
- **Type:** AFK
- **Blocked by:** Issue-2

### What to build
Implementação no `DowntimeService.ts` da Tag F (Retreinamento). Permite que um Andarilho dedique sua semana de recesso no Bastião para trocar talentos, magias aprendidas ou habilidades de classe obsoletas por novas opções equivalentes de mesmo nível.

### Acceptance criteria
- [x] Lógica da Tag F codificada no `DowntimeService.ts`.
- [x] Teste unitário em `DowntimeService.spec.ts` verificando a remoção do talento antigo e a atribuição do novo na ficha sob TDD.

---

## Issue 3G: DowntimeService - Tag G: Gestão de Domínio Regional

- **ID:** Issue-3G
- **Type:** AFK
- **Blocked by:** Issue-2

### What to build
Implementação no `DowntimeService.ts` da Tag G (Gestão de Domínio). Processar ações do jogador líder (General, Chanceler) dedicando a semana de recesso a coletar impostos ou estabilizar crises de influência de territórios regionais.

### Acceptance criteria
- [x] Lógica da Tag G codificada no `DowntimeService.ts`.
- [x] Teste unitário em `DowntimeService.spec.ts` simulando a rolagem de estabilidade e o recebimento de impostos na tesouraria do Bastião.

---

## Issue 3H: DowntimeService - Tag H: Juramento de Sangue (Alianças de Facção)

- **ID:** Issue-3H
- **Type:** AFK
- **Blocked by:** Issue-2

### What to build
Implementação no `DowntimeService.ts` da Tag H (Pacto de Patrocínio). Permite ao grupo de Andarilhos gastar artefatos e ouro para se aliar formalmente a uma grande facção regional. Rola-se `Social + Influência` vs DC da Facção (mínimo 15) para destrancar relíquias e reajustar standing.

### Acceptance criteria
- [x] Lógica da Tag H codificada no `DowntimeService.ts`.
- [x] Teste unitário em `DowntimeService.spec.ts` validando os requisitos de entrada (500 PO x Tier) e as atualizações de reputação no banco.

---

## Issue 4: Orquestração RPC, Transações SQLite WASM e Avanço de Clocks/Ameaça

- **ID:** Issue-4
- **Type:** AFK
- **Blocked by:** Issue-3A, Issue-3B, Issue-3C, Issue-3D, Issue-3E, Issue-3F, Issue-3G, Issue-3H

### What to build
Integração dos serviços no worker SQLite local-first. Codificar as mensagens RPC (ex: `RESOLVE_DOWNTIME_WEEK`, `ADD_RECESS_DAYS`) no `databaseWorkerHandler.ts` sob uma única transação atômica. Atualizar os Clocks de facção e Ameaça de Bastião à medida que as semanas passam, aplicando mitigações caso o recesso ocorra dentro da base guarnecida.

### Acceptance criteria
- [x] Worker Handler modificado com as assinaturas RPC.
- [x] Cliente RPC `WorkerDowntimeRepository` implementado.
- [x] Teste de integração `DowntimeIntegration.spec.ts` valida que recesso em Bastião seguro atenua efeitos de Clocks.
- [x] Teste valida o rollback total de dados no banco caso ocorra falha de validação ou erro de recurso.

---

## Issue 5: Painel DowntimePanel.svelte e Testes de UI sob Happy-DOM

- **ID:** Issue-5
- **Type:** AFK
- **Blocked by:** Issue-4

### What to build
Desenvolvimento da interface visual centralizada em Svelte 5 (`DowntimePanel.svelte`). Grid mostrando Andarilhos, seletores dropdown para as Tags (A a H), barra neon exibindo semanas globais disponíveis e botão "Resolver Semana". Exibir os resultados das rolagens diretamente no chat log do cockpit.

### Acceptance criteria
- [x] Componente `DowntimePanel.svelte` em `src/features/downtime/ui/` implementado sem cores Tailwind padrão.
- [x] Testes de UI reativa Happy-DOM em `DowntimePanel.spec.ts` validando reatividade dos runes de Svelte 5.
- [x] Teste valida que o botão de resolução fica desativado se o saldo de semanas globais de recesso for menor que 1.
- [x] Teste valida o disparo de alertas visuais de interrupção em caso de Clocks que disparam um evento de cerco militar.

---

## Issue 6: Cockpit App Shell e Validação do Quality Gate

- **ID:** Issue-6
- **Type:** AFK
- **Blocked by:** Issue-5

### What to build
Acoplar a nova Feature na UI do `App.svelte` e no menu lateral. Executar auditorias estritas de código no Windows (linter, types checks, svelte syntax e build de produção) e rodar automação final de fechamento.

### Acceptance criteria
- [x] `App.svelte` e navegação integrados.
- [x] `npm run quality:gate` concluído com sucesso e status passed.
- [x] Script `python scripts/pandorha_process_automation.py complete` executado.
