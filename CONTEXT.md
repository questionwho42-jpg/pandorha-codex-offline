# Pandorha Engine - Domínio: Léxico de Desenvolvimento

Este contexto define o vocabulário canônico do projeto Pandorha Engine para todos os domínios implementados. Agentes de IA e desenvolvedores DEVEM usar os termos aqui definidos ao escrever código, testes, comentários e documentação.

> **Regra de Interface:** Termos em `pt-BR` são usados em UI, docs de usuário, lore e regras de RPG. Termos em inglês (entre parênteses) são usados em identificadores, nomes de arquivo, APIs e código.

---

## Domínio Social e Sobrevivência

**Andarilho (PC / Wanderer):**
O personagem controlado pelo jogador que explora as ruínas biomecânicas.
_Avoid_: Herói, aventureiro, jogador, boneco

**Facção (Faction):**
Um dos grandes grupos que controlam parcelas de poder no Tier de Pandorha.
_Avoid_: Guilda, clã, tribo

**Fama (Fame):**
O valor positivo de reputação acumulado com uma facção que concede favores e barganhas.
_Avoid_: Reputação positiva, glória

**Dívida de Sangue (Blood Debt):**
Uma pendência de sangue ou recurso valioso assumida pelo Andarilho com terceiros.
_Avoid_: Débito comum, promissória, empréstimo

**Marcado pela Dívida (Debt-Marked):**
O estado em que um Andarilho tem sua Dívida de Sangue total superior a três vezes sua Fama total com as facções, atraindo caçadores e bloqueando o repouso.
_Regra_: `dívida > fama × 3` → status `DEBT_MARKED` ativo.
_Avoid_: Endividado, procurado

**Relógio de Progresso (Progress Clock):**
Uma representação gráfica dividida em segmentos que rastreia objetivos ou ameaças iminentes.
_Avoid_: Cronômetro, contador de turnos

**Vigília (Active Watch):**
Ação ativa de segurança no acampamento que consome slots de tempo do descanso em troca de controle de perigo.
_Avoid_: Turno de guarda, vigiar

**Combate Social (Social Combat):**
Encontro estruturado de debates e negociações de alta tensão onde os Andarilhos utilizam a retórica contra NPCs influentes.
_Avoid_: Discussão livre, debate simples

**Reserva de Paciência (Patience Pool / HP Social):**
Recurso do NPC no Combate Social que decrementa com falhas dos Andarilhos. Ao zerar, encerra a negociação com penalidades de Fama.
_Avoid_: Paciência comum, tolerância do NPC

**Trilha de Persuasão (Persuasion Track / Stagger Bar):**
Barra de desgaste de convicção do NPC no Combate Social. Quando completamente preenchida ou zerada pelos sucessos dos Andarilhos, garante a aceitação do acordo.
_Avoid_: Trilha de acordo, barra de convencimento

**Manobra Social (Social Maneuver):**
Ação retórica específica executada na ActionQueue de debate (ex: Persuadir, Intimidar, Barganhar, Blefar) que afeta de formas distintas a Reserva de Paciência e a Trilha de Persuasão.
_Avoid_: Argumento, fala de diálogo

---

## Domínio de Combate

**Fila de Ação (ActionQueue):**
Pool de comandos com semântica dupla: FIFO para sequenciamento normal de ações e LIFO para interrupções (Reações). Todo comando de combate — ataque, magia, manobra, condição — passa pela fila antes de ser resolvido.
_Localização_: `src/shared/action-queue/ActionQueueService.ts`
_Avoid_: Lista de ações, fila simples

**Turno (Turn):**
Unidade de tempo de combate. Um Andarilho possui por turno: 3 Ações [A], 1 Reação [R], Ações Livres [F] ilimitadas. O saldo de [A] e [R] é derivado do Ledger de Turno via `$derived`.
_Avoid_: Rodada (rodada = conjunto de turnos de todos os atores)

**Pipeline de Dano (DamagePipeline):**
Sequência determinística de 4 fases para calcular dano final:
1. `Phase_Base` — Dados + Atributos
2. `Phase_Crit` — Multiplicador de crítico (× 2 em 20 natural ou margem de 10)
3. `Phase_Reduction` — Redução de Dano (RD) fixa da armadura
4. `Phase_Affinity` — Resistência (× 0.5), Vulnerabilidade (+1d6) ou Imunidade (× 0)
_Localização_: `src/shared/damage/DamagePipelineService.ts`
_Avoid_: Cálculo de dano, dano simples

**Forja Tática (Tactical Forge / Synergy):**
Mecânica cooperativa de 2 passos (Simples: Abertura → Detonação) ou 3 passos (Completa: Abertura → Reforço → Detonação, dano × 2). Acumula stacks no alvo até o passo Detonação.
_Localização_: `src/entities/synergy/`, `src/features/combat-encounter/domain/CombatInventoryIntegration`
_Avoid_: Combo, sinergia simples

**Condição (Condition):**
Efeito de status que intercepta comandos na ActionQueue como middleware. Não altera atributos base; modifica o comportamento do comando em execução. Ex.: `Agarrado` altera `MoveCommand.distance` para 0.
_Avoid_: Debuff, status (genérico)

**Ataque Múltiplo (MAP — Multiple Attack Penalty):**
Penalidade aplicada ao 2º ataque (−5) e ao 3º+ ataque (−10) no mesmo turno.
_Constante_: `PANDORHA_RULES.COMBAT.MAP_PENALTY_1`, `MAP_PENALTY_2`
_Avoid_: Penalidade de ataque, multi-ataque

**Moribundo (Dying State):**
Estado de HP = 0. O Andarilho realiza Testes de Estabilização no início de cada turno. 3 sucessos = estabilizado; 3 falhas = morto. 20 natural = estabiliza imediatamente com 1 HP. 1 natural = conta como 2 falhas.
_Avoid_: Inconsciente, KO, quase morto

**Medidor de Tensão (Tension Meter):**
Recurso numérico individual de 0 a 100 pontos acumulado em combate através de gatilhos de crise (dano massivo sofrido, aliado a 0 HP, rolagens críticas próprias).
_Avoid_: Barra de fúria, relógio de perigo, barra de especial

**Limit Break:**
Estado de sobrecarga desencadeado quando o Medidor de Tensão alcança 100 pontos, permitindo a execução imediata de uma Habilidade Heroica.
_Avoid_: Especial ativado, surto heroico

**Habilidade Heroica (Ultimate / Heroic Ability):**
Técnica de alto impacto vinculada ao nível do Andarilho (desbloqueadas nos níveis 5 e 10) que não consome EE ou Ações comuns, mas exige o estado de Limit Break ou condições diárias específicas de classe.
_Avoid_: Magia final, golpe especial

**Papel Tático (Tactical Role):**
A classificação comportamental de uma criatura ou monstro em combate (ex: Bruto, Assassino, Suporte) que determina suas prioridades de alvo e regras de decisão na geração de comandos para a ActionQueue.
_Avoid_: Classe do monstro, comportamento simples

**Espólios de Guerra (Loot):**
O conjunto de recompensas (pontos de experiência, cobres e itens físicos de refugo) concedido aos Andarilhos no encerramento de um combate vitorioso e persistido de forma transacional atômica no banco SQLite.
_Avoid_: Drops, recompensas soltas, saques do chão

---

## Domínio de Magia

**Energia Etérica (Ethereal Energy / EE):**
Recurso consumido para conjurar magias. Calculado por `Nível + Mental` (varia por classe). Pode ser reduzido por condições como `EterFever`.
_Avoid_: Mana, MP, pontos de magia

**SpellCastBuilder (Construtor de Conjuração):**
Padrão Builder que valida a intenção de conjuração em 4 fases antes de gerar o comando imutável: Draft (seleção) → Weaving (metamagias) → Audit (custo + alvos) → Commit (comando na ActionQueue).
_Localização_: `src/features/spell-cast/domain/SpellCastBuilderService.ts`
_Avoid_: Lançar magia diretamente, cast simples

**Metamagia:**
Modificador opcional aplicado durante a fase Weaving do SpellCastBuilder. Aumenta o custo de EE e altera o comportamento da magia (ex.: alcance duplo, dano aumentado, área expandida).
_Avoid_: Modificador de magia, upgrades de magia

**Concentração (Concentration):**
Estado de foco que sustenta uma magia de duração. `ConcentrationRegistry` rastreia `ActorID → SpellID`. Qualquer dano sofrido injeta automaticamente um `ConcentrationCheck` na ActionQueue.
_Avoid_: Foco, manter ativo

**Círculo da Magia (Spell Circle):**
Nível de poder da magia (0 a 10). Determina o custo base de EE. Círculo 0 = cantrip (sem custo); círculo 1+ = custo crescente.
_Avoid_: Nível da magia (ambíguo com nível do personagem)

---

## Domínio de Exploração / Hexcrawl

**Tile de Mundo (WorldTile):**
O hexágono no grid axial com coordenadas `(q, r)`. Cada tile tem `region_tier` que define as DCs de encontro e o nível das ameaças da região.
_Localização_: `src/entities/world-tile/`, schema Drizzle em infra
_Avoid_: Célula, hexágono (como substantivo isolado)

**Encontro (Encounter):**
Evento procedural gerado pelo `EncounterService` durante a viagem pelo hexcrawl, baseado no `region_tier` do WorldTile atual. Pode ser combate, evento social ou descoberta.
_Localização_: `src/entities/world-tile/domain/EncounterService.ts`
_Avoid_: Evento aleatório, battle

**Relógio de Progresso (Progress Clock):**
Entidade `clocks` com fatias dinâmicas que disparam `event_triggers` ao completar todos os segmentos. Usado para rastrear objetivos (completar dungeon, missão de facção) e ameaças (horda se aproxima, ritual inimigo, clima regional extremo).
_Localização_: `src/entities/clocks/`, `src/features/clocks/`
_Avoid_: Contador de progresso, timer de missão

**Dia de Aventura (Adventure Day):**
Ciclo completo de tempo composto por exatamente 4 Turnos de Exploração. No final de cada Dia de Aventura, os Andarilhos consomem Provisões Diárias e o desgaste biológico é processado.
_Avoid_: Ciclo diário, dia comum

**Turno de Exploração (Exploration Turn):**
Unidade de escala de tempo no hexcrawl correspondente a 6 horas de atividade em marcha ou repouso (dividido em Manhã, Tarde, Anoitecer, Madrugada).
_Avoid_: Turno de viagem, rodada de mapa

**Papel de Viagem (Travel Role):**
Atribuição de responsabilidade atribuída a um Andarilho durante o Dia de Aventura. Os papéis canônicos são Guia (Navegação), Batedor (Vigilância), Forrageiro (Coleta) e Cartógrafo (Mapeamento).
_Avoid_: Trabalho de viagem, função de andarilho

**Clima Extremo (Extreme Weather):**
Estado meteorológico severo regional cuja presença e duração são reguladas por um Relógio de Progresso e que impõe penalidades de marcha ou abrigo aos Andarilhos.
_Avoid_: Tempo severo, tormenta isolada

**Cascata de Exaustão (Exhaustion Cascade / Exhaustion):**
Efeito de status composto por 5 níveis incrementais e cumulativos (Fadiga Corporal, Neblina Mental, Ruína Espiritual, Colapso Celular, Morte) que reduz as capacidades biológicas e atributos dos Andarilhos.
_Avoid_: Cansaço, nível de exaustão comum

---

## Domínio de Bastião e Camp

**Bastião (Bastion):**
Base de operações dos Andarilhos com infraestrutura modular. Módulos ativos concedem bônus passivos e desbloqueiam ações de Downtime.
_Localização_: `src/entities/bastion/`, `src/features/bastion/`
_Avoid_: Base, acampamento permanente, quartel

**Módulo de Bastião (Bastion Module):**
Estrutura construída no Bastião (ex.: Forja, Biblioteca Arcana, Enfermaria) que concede bônus específicos e ações de Downtime.
_Avoid_: Upgrade, melhoria, building

**Projeto de Downtime (Downtime Project):**
Ação de longa duração executada durante dias livres no Bastião. Consome tempo (Turnos Diários) e pode requerer recursos.
_Localização_: `src/features/bastion/ui/DowntimeProjectList.svelte`
_Avoid_: Projeto de base, ação de descanso

**Missão de Campanha (Campaign Quest):**
Uma missão focada na crônica principal e narrativa do Andarilho, aceita e resolvida através de Diálogos e pistas de Investigação.
_Avoid_: Quest principal, missão de história

**Contrato da Guilda (Guild Contract):**
Uma missão de downtime focada em recursos ou segurança, aceita em murais, que pode ser despachada para Esquadrões Mercenários ou resolvida diretamente.
_Avoid_: Quest secundária, sidequest, contrato comum


**Descanso de Acampamento (Camp Rest):**
Fase de alocação de slots de atividade durante descanso em campo. Cada herói escolhe uma atividade: Vigília (segurança), Reparo (itens), Cozinhar (recuperação de recursos), Recuperar (HP/EE).
_Localização_: `src/features/camp/`
_Avoid_: Descanso longo, long rest

**Durabilidade (Durability):**
Propriedade de integridade física de armas, armaduras e ferramentas categorizada em três estados: Mint, Damaged e Broken.
_Avoid_: Pontos de vida do item, integridade numérica

**Danificado (Damaged):**
Estado físico de desgaste de um equipamento que impõe uma penalidade de −1 em todos os testes associados ao seu uso.
_Avoid_: Trincado, desgastado (sem penalidade)

**Quebrado (Broken):**
Estado físico de falha total de um equipamento que impede completamente o seu uso ou concessão de benefícios até ser reparado.
_Avoid_: Destruído permanentemente

---

## Domínio de Companions

**Companheiro (Companion):**
Aliado não-jogador com HP próprio, habilidades, pool de ações e share sensorial com o Andarilho. Pode ser estabilizado como um PC quando atinge 0 HP.
_Localização_: `src/entities/companions/`, `src/features/camp/`
_Avoid_: NPC aliado, pet, sidekick

**Familiar (Familiar):**
Subtipo de Companheiro com vínculo mágico ao Andarilho. Partilha sensorial bidirecional e pode ser invocado/dispensado como ação de magia.
_Avoid_: Animal de estimação mágico

---

## Relacionamentos Chave

- Um **Andarilho** possui **Fama** em relação a uma ou mais **Facções**.
- Uma **Dívida de Sangue** pertence a um **Andarilho** e está associada a um cobrador específico.
- Se `Dívida > Fama × 3`, o **Andarilho** torna-se **Marcado pela Dívida** — descanso de acampamento falha automaticamente.
- Um **Encontro** é gerado ao entrar em um **Tile de Mundo** com base no `region_tier`.
- Uma **Condição** na **Fila de Ação** intercepta e modifica **Comandos** antes da resolução.
- Um **SpellCastBuilder** gera um **Comando** imutável que entra na **Fila de Ação**.

---

## Ambiguidades Resolvidas

- **"Reputação"** era vago: agora formalizado como **Fama** (positiva) e **Dívida de Sangue** (negativa)
- **"Nível da magia"** é ambíguo: use **Círculo da Magia** para o poder da spell e **Nível do Personagem** para a progressão do herói
- **"Descanso"** pode ser curto (in-dungeon, sem alocação) ou longo (Camp Rest com slots de atividade)
- **"Encontro"** na documentação de lore refere-se a qualquer evento narrativo; no código, `Encounter` é especificamente o resultado do `EncounterService` no hexcrawl
