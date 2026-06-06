# InventoryCapacityService Para Usuario

Este modulo calcula quanta carga um personagem consegue carregar e se ele ficou pesado demais.

Ele recebe Fisico, Resistencia, bonus de slots ja resolvidos e uma lista de itens com custo em slots. Depois devolve o limite, quantos slots foram usados e o estado final: normal, lento ou imobilizado.

Ele nao salva inventario. O inventario persistido sera reconstruido a partir de
eventos de itens carregados por personagem, e este modulo continuara apenas
calculando a carga resultante.
