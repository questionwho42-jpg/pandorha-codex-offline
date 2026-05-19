# Acampamento de treino

Este guia explica como testar a primeira versão da aba `Acampamento`.

## O que já funciona

- Criar personagens na aba `Personagens`.
- Abrir a aba `Acampamento`.
- Escolher uma ação para cada personagem durante 1 hora.
- Resolver a hora e ver o `Contador de Perigo`, o relógio `Fortificar perímetro` e o log.
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
9. Volte para `Personagens` e clique em `Salvar sessão`.
10. Recarregue a página.
11. Clique em `Carregar save`.
12. Volte para `Acampamento` e confirme que o perigo, o relógio e as ações foram restaurados.

## Limitações atuais

- A versão atual resolve apenas 1 hora.
- Não há rolagens de atividade, encontros, cura, kits ou noite inteira.
- `Cozinhar refeição` e `Reparar equipamento` são ações válidas, mas ainda não aplicam efeitos avançados.
- O save usa um único slot local chamado `primary`.
