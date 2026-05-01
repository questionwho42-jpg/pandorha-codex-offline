# GAME DESIGN DOCUMENT: PANDORHA ENGINE (v1.0)
> **Foco:** Tradução de Regras Analógicas para Lógica Computacional

---

## 1. Núcleo de Resolução e Dados
- **Triângulo de Críticos:** - **20 Natural:** Sucesso Crítico automático (Dano x2).
    - **1 Natural:** Falha Crítica automática.
    - **Margem de 10:** Se $(Resultado \geq DC + 10)$, o sucesso torna-se Crítico.
- **Graus de Sucesso (Exploração):** - Crítico (+2 sucessos no relógio), Sucesso (+1), Sucesso com Custo (Gasta PV/Ouro), Falha Crítica (Dispara perigo).

## 2. Economia de Combate e Espaço
- **Ações por Turno:** Pool de tokens fixo: 3 Ações [A], 1 Reação [R], Ações Livres [F].
- **Espaço:** Grid Matricial 2D (Coordenadas X, Y). 1 Quadrado = 1,5 metros.
- **Visibilidade:** Sistema declarativo por Tags. 
    - `[Oculto]`: Alvo não selecionável para ataques diretos.
    - `[Invisível]`: 50% de chance de erro (dado de bypass) + Detecção via Mental/Interação.

## 3. Tratado de Dano e Recursos
- **Pipeline de Dano:** Dano Base + Matriz $\rightarrow$ Crítico $\rightarrow$ Redução de Dano (RD) $\rightarrow$ Afinidades (Vulnerabilidade: +1d6; Resistência: 0.5x; Imunidade: 0x).
- **Dano por Tempo (DoT):** Sangramento, Veneno e Fogo são processados no **Início do Turno** da entidade.
- **Energia Etérica (EE):** Custo = Círculo da Magia + Adicionais de Metamagia.
- **Vigor (PV):** Gasto para Manobras/Itens. **Regra de Reembolso:** Sucesso Crítico devolve o PV gasto na ação.

## 4. Logística e Durabilidade
- **Inventário:** Slots limitados por $[Físico + Resistência] + 6$. 
- **Mãos Ocupadas:** O motor valida 2 Slots de Mão e X de Cinto.
- **Custo de Troca:** Equipar da mochila custa 1 Ação [A]. Sacar do Cinto é Livre [F].
- **Desgaste:** Itens tornam-se `Danificados` (-1) em 1s Naturais ou efeitos de inimigos. Reparo exige Ação de Acampamento + Kit.

## 5. Cooperação e IA
- **Sinergia (Forja Tática):** Acúmulo de Stacks no alvo. 
    - Simples (2 passos): Abertura $\rightarrow$ Detonação.
    - Completa (3 passos): Abertura $\rightarrow$ Reforço $\rightarrow$ Detonação (Dano x2).
- **IA de Inimigos:** Árvore de Decisão baseada em Prioridade e Papel Tático (Bruto, Assassino, Controlador, Suporte).

## 6. Exploração e Mundo
- **Escala de Tempo:** Ciclo estrito de 4 Turnos Diários (Manhã, Tarde, Noite, Madrugada).
- **Acampamento:** Tela de alocação de slots por herói (Vigília, Reparo, Cozinhar) com Contador de Perigo dinâmico.
- **Progressão:** Relógios de Progresso Ativos que disparam eventos (Triggers) ao completar fatias.
- **Dívida de Sangue:** Verificação em tempo real. Se $Dívida > (Fama \times 3)$, bloqueia descanso e gera o "Esquadrão do Favor Impossível".

## 7. Evolução e Conhecimento
- **XP Relativo:** Inimigo Nível = Grupo (1 XP); Nível > Grupo (2 XP); Nível < Grupo (0 XP).
- **Ritual de Level Up:** Só permitido em Cidades, Bastiões ou Locais Seguros.
- **Compêndio:** "Névoa de Dados" oculta stats de monstros novos. Desbloqueio via Pesquisa ou Encontros. 
- **Dev Tools:** Toggle `REVEAL_STATS` disponível para bypass de debug.