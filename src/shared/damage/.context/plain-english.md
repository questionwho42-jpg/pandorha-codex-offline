# Damage Plain English

Este módulo calcula quanto dano sobra depois que o jogo já sabe quanto saiu nos dados.

Ele soma o dano dos dados, a matriz usada e modificadores extras. Depois aplica crítico, redução de dano fixa, resistência, vulnerabilidade ou imunidade. O resultado é um número final de dano, mas o módulo ainda não mexe no HP de nenhum personagem.

## Alternativas

- Calcular dano direto dentro do combate: seria mais rápido no começo, mas espalharia regra matemática pelo projeto.
- Criar o cálculo como serviço puro: é o caminho atual, porque permite testar cada regra antes de conectar com combate, magia, monstros e interface.
- Persistir cada etapa agora: seria útil para auditoria futura, mas aumentaria o escopo antes de termos Worker/SQLite prontos para combate.
