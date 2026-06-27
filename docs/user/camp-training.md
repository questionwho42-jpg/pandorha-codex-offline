# Acampamento de treino

Este guia explica como testar a primeira versão da aba `Acampamento`.

## O que já funciona

- Criar personagens na aba `Personagens`.
- Abrir a aba `Acampamento`.
- Escolher uma ação para cada personagem durante 1 hora.
- Resolver a hora e ver o `Contador de Perigo`, o relógio `Fortificar perímetro` e o log.
- Preparar manualmente a próxima hora sem perder perigo ou progresso do relógio.
- Distinguir uma hora resolvida agora de uma hora restaurada do save local.
- Salvar e carregar esse estado no save local do navegador.

## Como testar no navegador

1. Abra `http://127.0.0.1:5173/`.
2. Entre em `Personagens`.
3. Crie pelo menos dois personagens válidos.
4. Entre em `Acampamento`.
5. Defina `Vigília` para um personagem.
6. Defina `Fortificar perímetro` para outro personagem.
7. Clique em `Resolver 1 hora`.
8. Confirme que o perigo subiu, o relógio avançou e o log apareceu.
9. Antes de continuar, confirme que o log da hora resolvida permanece visível.
10. Clique em `Preparar próxima hora`.
11. Confirme que a hora 2 está pronta, o perigo e o relógio foram preservados e as ações padrão foram reaplicadas.
12. Volte para `Personagens` e clique em `Salvar sessão`.
13. Recarregue a página.
14. Clique em `Carregar save`.
15. Volte para `Acampamento` e confirme que a hora 2 em planejamento foi restaurada.
16. Resolva a hora 2 e confirme o novo avanço de perigo e relógio.

## Limitações atuais

- Cada nova hora precisa ser preparada e resolvida manualmente.
- Não existe comando de noite completa ou reset manual nesta versão.
- Não há rolagens de atividade, encontros, cura, kits ou noite inteira.
- `Cozinhar refeição` e `Reparar equipamento` são ações válidas, mas ainda não aplicam efeitos avançados.
- O save continua na versão 9 e usa um único slot local chamado `primary`.
