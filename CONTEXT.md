# Pandorha Engine - Domínio Social e Sobrevivência

Este contexto define o vocabulário e as regras de negócio para a persistência social, progresso de tempo e gerenciamento de acampamento dos Andarilhos no mundo dark fantasy de Pandorha.

## Linguagem

**Andarilho (PC)**:
O personagem controlado pelo jogador que explora as ruínas biomecânicas.
_Avoid_: Herói, aventureiro, jogador, boneco

**Facção (Faction)**:
Um dos grandes grupos que controlam parcelas de poder no Tier de Pandorha.
_Avoid_: Guilda, clã, tribo

**Fama (Fame)**:
O valor positivo de reputação acumulado com uma facção que concede favores e barganhas.
_Avoid_: Reputação positiva, glória

**Dívida de Sangue (Blood Debt)**:
Uma pendência de sangue ou recurso valioso assumida pelo Andarilho com terceiros.
_Avoid_: Débito comum, promissória, empréstimo

**Marcado pela Dívida (Debt-Marked)**:
O estado em que um Andarilho tem sua Dívida de Sangue total superior a três vezes sua Fama total com as facções, atraindo caçadores e bloqueando o repouso.
_Avoid_: Endividado, procurado

**Relógio de Progresso (Progress Clock)**:
Uma representação gráfica dividida em segmentos que rastreia objetivos ou ameaças iminentes.
_Avoid_: Cronômetro, contador de turnos

**Vigília (Active Watch)**:
Ação ativa de segurança no acampamento que consome slots de tempo do descanso em troca de controle de perigo.
_Avoid_: Turno de guarda, vigiar

## Relacionamentos

- Um **Andarilho** possui **Fama** em relação a uma ou mais **Facções**.
- Uma **Dívida de Sangue** pertence a um **Andarilho** e está associada a um cobrador específico.
- Se o valor total das **Dívidas de Sangue** de um **Andarilho** for maior que 3 vezes sua **Fama** total com a facção correspondente, o **Andarilho** torna-se **Marcado pela Dívida**.
- O estado de **Marcado pela Dívida** impede que o **Andarilho** execute a fase de **Vigília** com sucesso ou conclua um descanso no acampamento sem ser emboscado.

## Diálogo de Exemplo

> **Desenvolvedor:** "Quando um **Andarilho** tenta descansar no acampamento, como a **Dívida de Sangue** interfere?"
> **Designer do Jogo:** "Se o Andarilho estiver **Marcado pela Dívida**, o acampamento é imediatamente interrompido por caçadores de recompensa e o descanso falha."

## Ambiguidades Resolvidas

- O termo "reputação" era usado de forma vaga. Agora está formalizado: usamos **Fama** para reputação local/global de facção, e **Dívida de Sangue** para pendências individuais.
