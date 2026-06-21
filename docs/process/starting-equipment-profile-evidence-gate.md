# Gate De Evidencia De Perfis Para Equipamento Inicial

## Objetivo

Este gate registra a auditoria de evidencia para tornar itens de kit inicial
equipaveis no loadout e no Combate. Ele complementa
`docs/process/starting-equipment-loadout-profile-gate.md` e nao altera
`docs/system/`, catalogos, save, inventario, loadout ou combate.

## Criterio De Desbloqueio

Um item so pode ganhar perfil de loadout/combate quando uma fonte soberana
especifica, fora de `docs/system/survival/pandorha-sistema-compilado.md`,
fornecer todos os dados abaixo:

- tipo de perfil: arma, armadura, escudo ou foco com regra propria;
- dado de dano ou bonus de CA;
- maos ou slot de loadout;
- tags mecanicas;
- penalidades aplicaveis;
- fonte e linha rastreaveis.

Mencoes soltas, exemplos de monstro, listas de kit e o sistema compilado nao
desbloqueiam codigo. Itens parecidos nao contam como substituicao automatica.

## Resultado Da Auditoria

| Item | Evidencia encontrada | Lacuna | Decisao |
| :--- | :--- | :--- | :--- |
| `chainmail` / Cota de Malha | Kit de Vanguarda em `docs/system/survival/regras-ouro-equipamento-inicial.md`, linha 24; kit de Vanguarda em `docs/system/survival/regras-economia-quebra-criacao-itens.md`, linha 46; penalidades parciais em `docs/system/survival/guia-criacao-de-ficha.md`, linha 878; exemplos de CA em monstros em `docs/system/combat/07-01a-tier1-mundo-natural.md`, linha 507, e `docs/system/combat/07-03a-tier3-lendas-vivas.md`, linha 223. | Falta fonte especifica nao compilada com bonus de CA completo, slot de loadout seguro, tags e penalidades consolidadas para personagem. Exemplos de monstro nao sao perfil de item do jogador. | Bloqueado. Continua ownership/carga sem acao de equipar. |
| `shortbow` / Arco Curto | Kit de Cacador em `docs/system/survival/regras-ouro-equipamento-inicial.md`, linha 25; kit de Cacador em `docs/system/survival/regras-economia-quebra-criacao-itens.md`, linha 50; exemplo de criatura com alcance e dano em `docs/system/combat/07-01b-tier1-sobrenatural.md`, linha 91. | O dado/alcance vem de criatura, nao de catalogo de item do jogador. Falta fonte especifica com maos/slot/tags/custo/penalidades. | Bloqueado. Continua ownership/carga sem acao de equipar. |
| `staff` / Cajado | Kit de Tecelao em `docs/system/survival/regras-ouro-equipamento-inicial.md`, linha 26; kit de Tecelao em `docs/system/survival/regras-economia-quebra-criacao-itens.md`, linha 54; foco/bateria de EE em `docs/system/magic/12-00-codex-de-magia.md`, linhas 305 e 315, e `docs/system/survival/regras-magia.md`, linha 300. | A evidencia descreve foco magico/bateria de EE, nao perfil de arma de combate nem regra completa de loadout. Falta dado de arma, maos/slot de loadout e tags de ataque. | Bloqueado para loadout/Combate. Pode informar gate futuro de foco magico, sem codigo nesta rodada. |
| `rapier` / Rapieira | Kit de Emissario em `docs/system/survival/regras-ouro-equipamento-inicial.md`, linha 27; kit de Emissario em `docs/system/survival/regras-economia-quebra-criacao-itens.md`, linha 58; exemplo de tipo de dano em `docs/system/combat/18-tratado-de-dano.md`, linha 79. | Falta dado, maos/slot, tags, custo e perfil de ataque. A mencao no tratado de dano so sugere perfurante. | Bloqueado. Continua ownership/carga sem acao de equipar. |
| `luxury-padded-armor` / Armadura Acolchoada de Luxo | Kit de Emissario em `docs/system/survival/regras-ouro-equipamento-inicial.md`, linha 27; kit de Emissario em `docs/system/survival/regras-economia-quebra-criacao-itens.md`, linha 58; mencao generica a Armadura Acolchoada em `docs/system/survival/guia-criacao-de-ficha.md`, linha 822. | Falta bonus de CA, slot, tags e penalidades. A fonte nao define a variante de luxo como perfil mecanico. | Bloqueado. Continua ownership/carga sem acao de equipar. |

## Decisao

Nenhum item auditado atingiu o criterio de desbloqueio nesta rodada. A branch de
implementacao `codex/feat/starting-equipment-supported-profiles` nao deve ser
aberta agora.

Continuam bloqueados em `OFFICIAL_LOADOUT_SUPPORTED_EQUIPMENT_IDS`,
`OFFICIAL_WEAPON_ATTACK_PROFILE_DEFINITIONS` e
`OFFICIAL_DEFENSE_PROFILE_DEFINITIONS`:

- `chainmail`;
- `shortbow`;
- `staff`;
- `rapier`;
- `luxury-padded-armor`.

## Proxima Implementacao Recomendada

A proxima fase de codigo so deve existir depois de uma destas condicoes:

1. uma fonte soberana especifica for revisada e trouxer todos os campos do
   criterio de desbloqueio para um ou mais itens;
2. o usuario aprovar substituicoes explicitas por itens ja suportados;
3. um gate de foco magico definir `staff` como foco de EE sem trata-lo como arma
   de combate.

Enquanto isso, a proxima fase recomendada permanece documental: contrato de
Magia minima para definir EE, conjurador de sessao, alvo e limite de efeitos sem
execucao real.
