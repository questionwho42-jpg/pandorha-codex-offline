# ADR-011: Persistência Transacional Atômica Imediata de Espólios de Guerra (Loot)

- **ID:** ADR-011
- **Status:** Aceito
- **Data:** 2026-06-04
- **Task Ledger:** N/A (Fase de Planejamento)

## Contexto

Após a vitória contra as ameaças em um encontro de combate no Pandorha Engine, os Andarilhos recebem espólios (experiência, cobres e refugo de itens de forja). Sob a perspectiva de experiência de usuário (UX) em jogos tradicionais, as recompensas são exibidas em uma tela de vitória e a gravação real no disco ocorre após a confirmação do jogador (clique em "Coletar"). Contudo, em uma aplicação local-first offline, esse modelo diferido abre brechas graves para perda de dados (se o navegador fechar com a tela de vitória aberta) ou para trapaças de reinicialização (*save scumming*), onde o jogador pode recarregar a SPA repetidamente até obter a rolagem de loot ideal das criaturas derrotadas.

## Decisão

Adotar a **Alternativa A (Atualização Imediata e Reativa em Lote no SQLite)**:

1. **Persistência Atômica no Banco de Dados:** Assim que o último monstro é derrotado e o combate é matematicamente resolvido como vitorioso, o `CombatLootService` consolida e persiste todas as recompensas no banco SQLite em uma transação atômica única no Web Worker, limpando simultaneamente o ID do combate ativo na sessão (`activeSession.combatEncounterId = null`).
2. **UI sem Estado de Confirmação:** O clique em "Coletar" no painel visual de vitória não executa gravação de banco; ele simplesmente fecha o modal de vitória e retorna o controle do mapa (Hexcrawl) para o jogador.
3. **Resolução de Sobrecarga Posterior:** Qualquer excesso de peso gerado por novos itens de refugo coletados é calculado de forma reativa pelo `InventoryCapacityService` após a persistência, impondo penalidades de movimento no hexcrawl a partir do próximo tick, sem a necessidade de criar regras complexas de "loot abandonado no chão" durante esta fase.

## Consequências

**Positivas:**
- **Atomicidade e Consistência Sólida:** Garante que o combate seja marcado como concluído e o loot seja gravado no mesmo bloco transacional do SQLite, impossibilitando anomalias de estado ou save-scumming.
- **Resiliência Local-First:** Crashs de sistema ou fechamentos de abas durante a exibição visual dos espólios não geram perdas de dados. Na reinicialização, o jogador já estará fora do combate com seu inventário e XP atualizados.

**Negativas:**
- **Inflexibilidade no Solo:** O Andarilho é obrigado a coletar tudo imediatamente, não podendo escolher deixar itens indesejados no chão para evitar sobrecarga no momento exato do término da batalha (a triagem de descarte deve ocorrer manualmente depois no inventário).

## Alternativas Consideradas

| Opção | Prós | Contras |
|:---|:---|:---|
| **Atualização Imediata (Escolhida)** | Atomicidade absoluta, proteção contra save-scumming, resiliência local-first. | Itens indesejados entram temporariamente no inventário e devem ser limpos manualmente se causarem sobrecarga. |
| **Persistência por Confirmação** | Permite fluxos de animação e rejeição de itens antes de gravar no disco. | Altamente vulnerável a travamentos e save-scumming; quebra a garantia local-first. |
| **Bolsa de Espólios no Chão** | Realismo tático extremo; o peso só entra no inventário se o jogador mover o item do chão. | Aumento excessivo de escopo com novas tabelas e gerenciadores de expiração de objetos no mapa axial. |
