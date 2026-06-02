---
name: character-builder
description: Auxilia a criacao e validacao de fichas de personagem de Pandorha com base no manifesto de regras, template de ficha e sincronizacao controlada com banco local.
version: 1.0.0
---

# Character Builder

Use esta skill para montar, revisar ou validar fichas de personagem conforme a regra 3x3, ancestralidade, classe, antecedente e recursos derivados.

## Quality Gate

- Validar `references/rules_manifest.json`.
- Rodar `scripts/validator.py` com uma ficha valida e uma ficha invalida.
- Usar `scripts/sync_db.py` apenas contra banco temporario ou ambiente explicitamente aprovado.
