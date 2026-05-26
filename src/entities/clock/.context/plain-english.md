# Clock In Plain Portuguese

Um relogio acompanha o progresso de algo que precisa de varias etapas para terminar. No primeiro acampamento, ele servira para mostrar quanto falta para `Fortificar perimetro`.

Nesta etapa o jogo ja sabe como guardar esse relogio no banco local do navegador, mas ainda nao mostra uma tela nova para usa-lo. O codigo define o formato correto, valida os dados e impede que o progresso passe do limite combinado.

Uma alternativa seria guardar so um numero solto na tela, mas isso dificultaria salvar, revisar e reaproveitar o mesmo mecanismo em outras partes do jogo.

T70 reutiliza esse mecanismo para retaliação social. Quando uma facção fica ofendida por pressão, o jogo cria um clock `0/4 fatias` que aparece em Relações e volta depois do save/load.
