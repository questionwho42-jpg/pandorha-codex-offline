# Relações Sociais Em Português Simples

A tela de Relações mostra facções de treino e a relação atual do grupo com cada uma.

O usuário pode invocar um favor simples, o que aumenta a Dívida de Sangue e a Intriga, ou abater uma parte da dívida.

Essas mudanças já entram no save local. Depois de salvar, recarregar a página e carregar o save, a dívida e a intriga devem voltar como estavam.

Esta tela ainda não tem NPCs, diálogos, teste de Prestígio, facções oficiais definitivas nem consequências de mundo.

T70 mostra clocks ativos de retaliação quando pressão social cria esse risco. A tela só exibe o aviso; ela não avança nem resolve o clock.

T76 mostra `Relações por NPC` quando existe uma relação individual salva. Por exemplo, depois de usar `Pressionar`, a `Corretora de Treino` pode aparecer como uma relação tensionada. A tela apenas exibe esse estado; a regra que muda a relação fica no fluxo de negociação/social pressure do app.

T80 organiza essas relações individuais por facção. Isso ajuda a enxergar se vários NPCs pertencem ao mesmo grupo político sem mudar save, banco, regras ou cálculo social.

T82 adiciona filtros nessa lista de NPCs: `Todos`, `Atenção`, `Estáveis`, `Aliados` e `Inimigos`. O filtro só muda o que aparece na tela no momento; ele não salva nada novo, não avança clocks e não muda a relação com nenhum NPC.
