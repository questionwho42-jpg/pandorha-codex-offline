# Gate De Indexacao Estatica Do Compendio

## Objetivo

Este gate aprova a proxima fatia do Compendio: gerar um indice estatico,
versionado e validado de metadados a partir de `docs/system/`, para ampliar a
busca navegavel sem carregar Markdown bruto no navegador.

Esta fase nao altera regras de RPG, nao edita `docs/system/`, nao interpreta
mecanicas, nao cria banco, nao cria Worker, nao muda save/load e nao usa resumo
por IA.

## Fontes Revisadas

- Catalogo curado atual: `compendiumCatalog.ts`.
- Schema atual: `compendiumSchema.ts`.
- Busca atual: `CompendiumSearchService.ts`.
- UI atual: `CompendiumBrowser.svelte`.
- Roadmap pos-auditoria: `docs/process/ui-reachability-follow-up-roadmap.md`.
- Entradas de origem: `20260505-185244-t16a-compendium-base-catalog` e
  `20260505-190555-t17a-compendium-browser-ui`.

## Contrato Aprovado

A implementacao deve criar um script local `scripts/generate_compendium_catalog.mjs`
com dois modos:

- modo padrao: regrava o arquivo gerado;
- `--check`: falha quando o arquivo gerado estiver desatualizado.

O script deve ler somente:

- `docs/system/survival/**/*.md`;
- `docs/system/combat/**/*.md`;
- `docs/system/magic/**/*.md`.

O script deve excluir explicitamente
`docs/system/survival/pandorha-sistema-compilado.md`, porque ele duplica o
corpus de sistema e inflaria resultados.

Cada documento indexado gera uma entrada com:

```ts
type GeneratedCompendiumEntry = Readonly<{
  id: string;
  title: string;
  category: "system-survival" | "system-combat" | "system-magic";
  summary: string;
  sourceFile: string;
  sourceLine: number;
  searchText: string;
  tags: readonly string[];
}>;
```

As entradas geradas devem ser validadas por `compendiumEntrySelectSchema` antes
de serem versionadas.

## Regras De Extracao

- `id`: derivado do caminho relativo sem extensao, em slug ASCII estavel.
- `title`: primeiro H1 (`# ...`) do arquivo; fallback para nome do arquivo.
- `category`: derivada da pasta raiz (`survival`, `combat` ou `magic`).
- `summary`: primeiro paragrafo legivel apos o H1, limitado pelo schema atual.
- `sourceFile`: caminho relativo do arquivo Markdown.
- `sourceLine`: linha do H1 ou `1` quando houver fallback.
- `searchText`: titulo, resumo, caminho e tags normalizados.
- `tags`: categoria, pasta raiz e slug do arquivo, sem duplicatas.

O script deve ignorar metadados e blocos que nao devem virar resumo:

- frontmatter YAML;
- blocos `<ai_ignore>...</ai_ignore>`;
- blocos `<ai_context>` e `</ai_context>` como marcadores;
- imagens, tabelas, HTML isolado e linhas vazias.

## Categorias Visiveis

A UI deve mapear as categorias novas para pt-BR:

- `system-survival`: `Sobrevivencia`;
- `system-combat`: `Combate`;
- `system-magic`: `Magia`.

As categorias curadas existentes continuam validas:

- `character-creation`;
- `ancestry`;
- `class`;
- `background`.

## Fora Do Escopo

- Indexar `lore/`;
- alterar `docs/system/`;
- usar IA para resumo ou classificacao;
- embeddings, busca semantica ou dependencia nova;
- SQLite, OPFS, Worker, RPC ou save;
- interpretar mecanicas, validar equilibrio ou criar regras;
- abrir o Markdown completo dentro da UI;
- promover entradas antigas do Compendio para `docs/system/`.

## Gates Obrigatorios

- TDD para o script gerador.
- Testes de catalogo e busca do Compendio.
- `npm.cmd run compendium:generate:check`.
- `npm.cmd run quality:automation`.
- `npm.cmd run qa:ui-reachability`.
- `npm.cmd run qa:vertical-slice`.
- `npm.cmd run docs:audit`.
- Browser do Codex validando busca e filtro em Compendio, nove abas e console
  sem erros.
