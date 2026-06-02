# WorldState In Plain Portuguese

WorldState e o quadro de anotações do mundo. Ele guarda fatos simples como "o portão de Morden está aberto" ou "a NPC Vanya está hostil".

Nesta etapa ele ainda não salva no navegador de verdade. O código só define o formato correto dessas anotações, valida nomes e valores, e impede que partes internas do sistema sejam alteradas como se fossem flags narrativas.

Uma alternativa seria guardar tudo direto em memória sem validação, mas isso faria o jogo esquecer regras importantes e aumentaria o risco de saves quebrados no futuro.
