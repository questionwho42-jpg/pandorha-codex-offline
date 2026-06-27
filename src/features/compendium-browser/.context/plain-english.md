# Navegador Do Compendio Em Linguagem Simples

A tela de Compendio permite pesquisar regras revisadas do Pandorha sem abrir os arquivos manualmente.

Nesta versao, ela usa entradas curadas e tambem um indice estatico gerado para regras de sobrevivencia, combate e magia. O usuario pode buscar por texto, filtrar por categoria, passar paginas, limpar filtros quando nada aparecer e clicar em uma entrada para ver o resumo e a fonte no formato arquivo:linha.

Quando ha uma busca textual, os resultados aparecem primeiro quando o titulo combina melhor, depois quando tags/categoria combinam, e por ultimo quando o termo aparece no resumo ou no texto indexado. Isso ajuda a achar entradas mais provaveis sem usar IA.

Ela ainda nao le Markdown no navegador, nao interpreta mecanicas, nao usa busca semantica e nao salva nada no banco.

Em 2026-06-20, a tela ganhou filtros para entradas curadas, `Sistema: Sobrevivencia`, `Sistema: Combate` e `Sistema: Magia`.

Em 2026-06-21, a tela ganhou ranking textual deterministico, paginacao e estado vazio com botao para limpar busca e filtros.
