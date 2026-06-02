# Especificação De Máquinas De Estado (FSM)

Este documento traduz as regras mecânicas do GDD de Pandorha para fluxos lógicos determinísticos. Ele serve como prompt de contexto rígido para a geração de código, proibindo qualquer implementação que desvie das transições de estado aqui definidas.

1. Arquitetura Base: O Motor de Eventos

O motor opera sob o paradigma de Event Sourcing. O estado atual é uma derivação reativa de um log de eventos.

1.1 Fila de Resolução Global (Action Queue)

Tipo: Pilha (Stack/LIFO) para interrupções e Fila (Queue/FIFO) para sequenciamento.

Função: Orquestrar a ordem de execução de Comandos (Ataques, Magias, Reações).

Processador: Um CommandProcessor que consome a fila e aplica o pipeline de Middlewares.

1.2 Ledger de Turno

Implementação: Array reativo ($state) de eventos de consumo.

Cálculo de Recursos: Saldos de [A], [R] e [F] são $derived do Ledger.

Persistência: Apenas o Ledger é serializado no SQLite; o estado do turno é reconstruído no carregamento.

2. Estados de Combate e Turno

2.1 Máquina de Turno (TurnFSM)

Define o que um ator pode fazer durante sua iniciativa.

Estado

Gatilho de Entrada

Transições Permitidas

Saída

WAITING

Início do Combate

ACTIVE (quando índice de iniciativa coincide)

Próximo Ator

ACTIVE

Ordem de Iniciativa

ACTION_PREP, REACTION_WAIT, ENDING

Comando TurnEnd

ACTION_PREP

Clique em Habilidade

RESOLVING (via Action Queue)

Resolução

DYING

HP <= 0

STABILIZING (Única ação permitida)

Estabilizado ou Morto

2.2 Pipeline de Dano (Chain of Responsibility)

Todo DamageEvent deve passar obrigatoriamente pelas seguintes fases:

Phase_Base: Cálculo [Dados + Atributos].

Phase_Crit: Aplicação de multiplicadores (20 Natural ou Margem 10).

Phase_Reduction: Redução de Dano (RD) fixa da armadura/item.

Phase_Affinity: Multiplicadores de Resistência (0.5x), Vulnerabilidade (+1d6) ou Imunidade (0x).

3. Middlewares e Interceptadores (Condições e Sinergias)

As Condições e Sinergias não alteram os atributos base; elas interceptam comandos na ActionQueue.

3.1 Ciclo de Vida de Condições

Entrada: Command_ApplyCondition injetado na fila.

Atuação: O middleware analisa o currentCommand. Ex: Agarrado altera MoveCommand.distance para 0.

Saída: Injetar RoundEndCommand na fila processa a redução de turnos/duração.

3.2 Forja Tática (Sinergia)

Abertura: Middleware aplicado ao alvo que expira ao receber uma "Detonação".

Detonação: Comando que carrega a tag [Detonador]. Ao ser processado contra um alvo com "Abertura", o middleware de Sinergia aplica o multiplicador de dano no pipeline.

4. Máquina de Equipamento e Inventário

4.1 Durabilidade (ItemFSM)

Estados: MINT (Novo) → DAMAGED (-1 penalidade) → BROKEN (Bloqueia uso).

Transição de Quebra: Disparada por 1 Natural ou dano massivo (Aparar).

Validação: O método item.canExecute(command) é invocado antes de entrar na ActionQueue.

4.2 Manipulação de Mãos

Slots Ativos: MainHand, OffHand, QuickSlot.

Custo de Transição: - Mochila → SlotAtivo: 1 Ação [A].

Cinto → SlotAtivo: Ação Livre [F].

5. Máquina de Magia (Motor Arcano)

5.1 Condução via Builder

Nenhuma magia vai direto para a fila. Ela passa pelo SpellCastBuilder:

Draft: Seleção da Magia.

Weaving: Adição de Metamagias (Validação de Keywords/Tags).

Audit: Cálculo de custo total de EE e Alvos.

Commit: Geração do Comando imutável para a ActionQueue.

5.2 Concentração

Registro: ConcentrationRegistry monitora ActorID → SpellID.

Gatilho de Queda: Qualquer comando de dano resolvido contra o ActorID injeta automaticamente um ConcentrationCheck na ActionQueue.

6. Exploração e Interação Social

6.1 Fluxo de Viagem (Wizard Pattern)

A FSM de Exploração exige a resolução linear:
Ritmo → Papéis → Navegação → Encontro → Logística → Consumo.
Nota: Estados futuros são bloqueados (disabled) até a conclusão do passo anterior.

6.2 Persuasão (Social Combat Wrapper)

Tratada como combate sem grid:

Alvo: Possui Reserva de Paciência (HP Social) e Trilha de Persuasão (Stagger Bar).

Ações: Manobras Sociais na ActionQueue.

Dano: Sucessos reduzem a Trilha (objetivo); Falhas reduzem a Paciência (NPC desiste).

7. Persistência de Estado

7.1 Event Sourcing Strategy

O salvamento no SQLite consiste na serialização do Ledger de Eventos.

Save: JSON.stringify(eventLedger).

Load: O motor instancia as FSMs em estado inicial e executa o replay() dos eventos para atingir o estado atual da UI.

Undo: Operação .pop() no ledger seguida de re-renderização reativa.

⚠️ Restrições de Implementação para o Codex

NUNCA modifique valores de HP ou EE sem um Evento no Ledger.

NUNCA ignore a ActionQueue para resoluções imediatas.

SEMPRE valide a breaksStealth tag antes de finalizar um comando de ataque.

SEMPRE utilize $derived para mostrar estados que dependem de condições ativas.
