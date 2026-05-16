# Persistence In Plain Portuguese

Persistência é a parte que prepara o arquivo de save local do Pandorha no navegador.

Nesta etapa o jogo ainda não mostra botão de salvar. O que foi criado é o caminho técnico para abrir ou criar um banco SQLite dentro do armazenamento privado do navegador e aplicar as tabelas necessárias.

Os testes usam uma memória falsa no lugar do OPFS real. Isso permite validar o comportamento sem depender do navegador até a etapa de UI.
