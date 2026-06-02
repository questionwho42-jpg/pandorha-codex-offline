---
name: hexcrawl-generator
description: Gera e valida estruturas de hexcrawl de Pandorha usando schema axial, topografia consistente e relatorios de exploracao.
version: 1.0.0
---

# Hexcrawl Generator

Use esta skill quando for necessario criar, validar ou auditar mapas hexcrawl e suas relacoes de vizinhanca, tier regional e topografia.

## Quality Gate

- Validar `references/hex-schema.sql`.
- Rodar `scripts/verify-topography.ts` contra fixtures pequenas.
- Rejeitar regioes desconectadas, tiers invalidos e vizinhancas impossiveis.
